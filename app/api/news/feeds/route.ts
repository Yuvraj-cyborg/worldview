import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { FEEDS, INTEL_FEEDS } from "@/lib/data/feeds";

const ALL_FEEDS = [...FEEDS, ...INTEL_FEEDS];
import { clusterNews } from "@/lib/services/clustering";
import { cachedFetch, deleteCachedKey } from "@/lib/cache/redis";
import { getCircuitBreaker } from "@/lib/utils/circuit-breaker";
import type { NewsItem, ClusteredEvent } from "@/lib/types";

// ─── CRITICAL: Force dynamic so Next.js never static-caches this route ───
export const dynamic = "force-dynamic";
export const revalidate = 0;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // CRITICAL: Decode HTML entities in text content (&#039; → ', &#xD; → CR, etc.)
  htmlEntities: true,
  processEntities: true,
});

const FEED_TIMEOUT_MS = 10_000;
const CACHE_KEY = "wv:news:feeds:v2";
const CACHE_TTL = 120; // 2 minutes — fresh TTL (grace period = 3x = 6 min)
const MAX_ITEMS_PER_FEED = 25;
const MAX_TOTAL_ITEMS = 600;
const MAX_CLUSTERS = 120;

// ─── Feed health tracking (in-memory per instance) ──────────────────────
const feedHealth = new Map<string, { successes: number; failures: number; lastError?: string; lastSuccess?: number }>();

function trackFeedResult(name: string, success: boolean, error?: string): void {
  const h = feedHealth.get(name) ?? { successes: 0, failures: 0 };
  if (success) {
    h.successes++;
    h.lastSuccess = Date.now();
  } else {
    h.failures++;
    h.lastError = error;
  }
  feedHealth.set(name, h);
}

interface RSSItem {
  title?: string | Record<string, unknown>;
  link?: string | Record<string, string>;
  guid?: string;
  pubDate?: string;
  published?: string;
  updated?: string;
  description?: string;
  "media:content"?: { "@_url"?: string };
  enclosure?: { "@_url"?: string };
}

// ─── Non-English day/month names → English (for date parsing) ───────────
const DAY_MAP: Record<string, string> = {
  lunes: "Monday", martes: "Tuesday", miércoles: "Wednesday", miercoles: "Wednesday",
  jueves: "Thursday", viernes: "Friday", sábado: "Saturday", sabado: "Saturday",
  domingo: "Sunday", montag: "Monday", dienstag: "Tuesday", mittwoch: "Wednesday",
  donnerstag: "Thursday", freitag: "Friday", samstag: "Saturday", sonntag: "Sunday",
  lundi: "Monday", mardi: "Tuesday", mercredi: "Wednesday", jeudi: "Thursday",
  vendredi: "Friday", samedi: "Saturday", dimanche: "Sunday",
};
const MONTH_MAP: Record<string, string> = {
  enero: "January", febrero: "February", marzo: "March", abril: "April",
  mayo: "May", junio: "June", julio: "July", agosto: "August",
  septiembre: "September", octubre: "October", noviembre: "November", diciembre: "December",
  januar: "January", februar: "February", märz: "March", maerz: "March",
  mai: "May", juni: "June", juli: "July", oktober: "October", dezember: "December",
  janvier: "January", février: "February", fevrier: "February", mars: "March",
  avril: "April", juin: "June", juillet: "July", août: "August", aout: "August",
  septembre: "September", octobre: "October", novembre: "November", décembre: "December",
};

/**
 * Robust date parser that handles:
 * - Standard RFC 2822 / ISO 8601 dates
 * - Drupal-style: "Tuesday, March 3, 2026 - 13:53"
 * - Non-English day/month names
 * - Returns null (NOT new Date()) if unparseable
 */
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  // 1. Try native Date parsing first (handles RFC 2822, ISO 8601)
  const native = new Date(dateStr);
  if (!isNaN(native.getTime())) {
    // Sanity check: reject dates more than 7 days in the future or before 2020
    const now = Date.now();
    if (native.getTime() > now + 7 * 86400_000 || native.getTime() < new Date("2020-01-01").getTime()) {
      return null;
    }
    return native;
  }

  // 2. Normalize non-English day/month names
  let normalized = dateStr.toLowerCase();
  for (const [foreign, english] of Object.entries(DAY_MAP)) {
    normalized = normalized.replace(new RegExp(`\\b${foreign}\\b`, "i"), english);
  }
  for (const [foreign, english] of Object.entries(MONTH_MAP)) {
    normalized = normalized.replace(new RegExp(`\\b${foreign}\\b`, "i"), english);
  }

  // 3. Try Drupal-style pattern: "Day, Month DD, YYYY - HH:MM"
  const drupalMatch = normalized.match(
    /(?:\w+,\s+)?(\w+)\s+(\d{1,2}),?\s+(\d{4})\s*[-–]\s*(\d{1,2}):(\d{2})/i
  );
  if (drupalMatch) {
    const [, month, day, year, hour, minute] = drupalMatch;
    const attempt = new Date(`${month} ${day}, ${year} ${hour}:${minute}:00 UTC`);
    if (!isNaN(attempt.getTime())) return attempt;
  }

  // 4. Try after removing locale-specific prefixes
  const cleanedNormalized = normalized.replace(/^\w+,\s*/, "").replace(/\s*[-–]\s*/, " ");
  const retried = new Date(cleanedNormalized);
  if (!isNaN(retried.getTime())) return retried;

  // 5. Give up — return null so callers can decide what to do
  return null;
}

/** Decode common HTML entities that fast-xml-parser might miss */
function decodeEntities(text: string): string {
  return text
    .replace(/&#0*39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#xD;/gi, "")
    .replace(/&#xA;/gi, " ")
    .replace(/&#0*13;/g, "")
    .replace(/&#0*10;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrl(item: RSSItem): string | undefined {
  return item["media:content"]?.["@_url"] || item.enclosure?.["@_url"];
}

async function fetchSingleFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
  const cb = getCircuitBreaker(`feed:${feed.name}`, {
    failureThreshold: 3,
    resetTimeMs: 120_000, // 2 min cooldown when tripped
    halfOpenMaxAttempts: 1,
  });

  try {
    return await cb.execute(async () => {
      const resp = await fetch(feed.url, {
        signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
        headers: {
          "User-Agent": "WorldView/1.0 (Global Intelligence Dashboard)",
          "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml",
        },
        // CRITICAL: Do NOT use Next.js fetch cache here — we manage caching via Redis
        cache: "no-store",
      });

      if (!resp.ok) {
        const errText = `HTTP ${resp.status}`;
        trackFeedResult(feed.name, false, errText);
        console.warn(`[feed:${feed.name}] ${errText}`);
        return [];
      }

      const xml = await resp.text();
      if (!xml || xml.length < 50) {
        trackFeedResult(feed.name, false, "empty response");
        return [];
      }

      const parsed = parser.parse(xml);
      const channel = parsed?.rss?.channel || parsed?.feed;
      if (!channel) {
        trackFeedResult(feed.name, false, "no channel/feed element");
        return [];
      }

      const rawItems: RSSItem[] = channel.item || channel.entry || [];
      const itemList = Array.isArray(rawItems) ? rawItems : [rawItems];

      const now = new Date();
      const items: NewsItem[] = [];

      for (const item of itemList) {
        if (!item.title || (!item.link && !item.guid)) continue;
        if (items.length >= MAX_ITEMS_PER_FEED) break;

        // Decode HTML entities and clean up whitespace in title
        const rawTitle = typeof item.title === "string" ? item.title.trim() : String(item.title ?? "");
        const title = decodeEntities(rawTitle);
        if (!title || title.length < 5) continue; // Skip junk titles

        let link = "";
        if (typeof item.link === "string") link = item.link;
        else if (item.link && typeof item.link === "object") link = item.link["@_href"] ?? "";
        else if (item.guid) link = item.guid;

        // Parse date — if null, item has no valid date, so skip it
        // (prevents undated/misdated items from showing as "just now")
        const pubDate = parseDate(item.pubDate || item.published || item.updated);
        if (!pubDate) continue;

        // Reject items older than 7 days (stale content from rarely-updated feeds)
        const ageMs = now.getTime() - pubDate.getTime();
        if (ageMs > 7 * 24 * 60 * 60 * 1000) continue;

        // Reject items dated in the future by more than 1 hour
        if (ageMs < -3600_000) continue;

        items.push({
          source: feed.name,
          title,
          link,
          pubDate,
          isAlert: false,
          tier: feed.tier,
          category: feed.category,
          imageUrl: extractImageUrl(item),
        });
      }

      trackFeedResult(feed.name, true);
      return items;
    });
  } catch (err) {
    // Circuit breaker tripped or other error
    const errText = err instanceof Error ? err.message : String(err);
    trackFeedResult(feed.name, false, errText);
    // Only log non-circuit-breaker errors (CB already logs its own trips)
    if (!errText.includes("Circuit breaker")) {
      console.warn(`[feed:${feed.name}] error: ${errText}`);
    }
    return [];
  }
}

interface FeedResponse {
  clusters: ClusteredEvent[];
  totalItems: number;
  feedsLoaded: number;
  feedsFailed: number;
  fetchedAt: string; // ISO timestamp of when data was actually fetched
  fromCache: boolean;
}

async function fetchAllFeeds(): Promise<FeedResponse> {
  const startTime = Date.now();

  // Fetch all feeds in parallel with individual circuit breakers
  const feedResults = await Promise.allSettled(
    ALL_FEEDS.map((feed) => fetchSingleFeed(feed))
  );

  const allItems: NewsItem[] = [];
  let feedsLoaded = 0;
  let feedsFailed = 0;

  for (const result of feedResults) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allItems.push(...result.value);
      feedsLoaded++;
    } else {
      feedsFailed++;
    }
  }

  // Deduplicate by normalized title
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    const key = item.title.toLowerCase().trim().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  // Filter out items older than 72 hours (stale news cleanup)
  const cutoff = Date.now() - 72 * 60 * 60 * 1000;
  const recent = deduped.filter((item) => item.pubDate.getTime() > cutoff);

  const clusters = clusterNews(recent.slice(0, MAX_TOTAL_ITEMS));
  const elapsed = Date.now() - startTime;

  console.log(
    `[news/feeds] Fetched ${feedsLoaded}/${ALL_FEEDS.length} feeds, ` +
    `${feedsFailed} failed, ${allItems.length} raw items, ` +
    `${deduped.length} deduped, ${recent.length} recent (<72h), ` +
    `${clusters.length} clusters in ${elapsed}ms`
  );

  return {
    clusters: clusters.slice(0, MAX_CLUSTERS),
    totalItems: recent.length,
    feedsLoaded,
    feedsFailed,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const forceRefresh = searchParams.get("force") === "true";

    const data = await cachedFetch<FeedResponse>(
      CACHE_KEY,
      CACHE_TTL,
      fetchAllFeeds,
      { forceRefresh }
    );

    if (!data) {
      // Cache and fetcher both failed — try direct fetch as last resort
      console.warn("[api/news/feeds] cachedFetch returned null, trying direct fetch");
      const fresh = await fetchAllFeeds();
      return NextResponse.json(fresh, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Data-Source": "direct-fallback",
          "X-Fetched-At": fresh.fetchedAt,
        },
      });
    }

    return NextResponse.json(
      { ...data, fromCache: data.fromCache !== false },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Data-Source": data.fromCache !== false ? "cache" : "fresh",
          "X-Fetched-At": data.fetchedAt ?? new Date().toISOString(),
        },
      }
    );
  } catch (err) {
    console.error("[api/news/feeds] fatal error:", err);
    return NextResponse.json(
      {
        clusters: [],
        totalItems: 0,
        feedsLoaded: 0,
        feedsFailed: ALL_FEEDS.length,
        fetchedAt: new Date().toISOString(),
        fromCache: false,
        error: "Failed to fetch feeds",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

// ─── POST handler to force-clear cache (for debugging / manual refresh) ──
export async function POST() {
  try {
    await deleteCachedKey(CACHE_KEY);
    return NextResponse.json({ cleared: true, key: CACHE_KEY });
  } catch (err) {
    return NextResponse.json({ cleared: false, error: String(err) }, { status: 500 });
  }
}
