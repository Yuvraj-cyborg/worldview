import { NextRequest, NextResponse, after } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { FEEDS, INTEL_FEEDS } from "@/lib/data/feeds";
import { clusterNews } from "@/lib/services/clustering";
import { getCachedJson, setCachedJson, deleteCachedKey } from "@/lib/cache/redis";
import { getCircuitBreaker } from "@/lib/utils/circuit-breaker";
import type { NewsItem, ClusteredEvent } from "@/lib/types";

// Sort feeds by tier so the most important sources are fetched first
// Tier 1 (wire services/govt) → Tier 2 (major outlets) → Tier 3 (specialty) → Tier 4 (aggregators)
const ALL_FEEDS = [...FEEDS, ...INTEL_FEEDS].sort((a, b) => (a.tier ?? 4) - (b.tier ?? 4));

// ─── CRITICAL: Force dynamic so Next.js never static-caches this route ───
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60; // 60s on Pro, ignored on Hobby (10s hard limit)

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  htmlEntities: true,
  processEntities: true,
});

// ─── Tuning constants ───────────────────────────────────────────────────
const FEED_TIMEOUT_MS = 5_000;    // 5s per feed (keep tight for Vercel)
const BATCH_SIZE = 25;             // 25 feeds per concurrent batch
const FETCH_BUDGET_MS = 7_500;     // 7.5s max for inline fetch (cold cache)
const AFTER_BUDGET_MS = 9_000;     // 9s max for after() background enrichment
const CACHE_KEY = "wv:news:feeds:v4";
const CACHE_TTL = 180;             // 3 min fresh TTL
const CACHE_GRACE = CACHE_TTL * 3; // 9 min grace for stale-while-revalidate
const MAX_ITEMS_PER_FEED = 15;
const MAX_TOTAL_ITEMS = 400;
const MAX_CLUSTERS = 80;

/** Envelope stored in Redis with metadata */
interface CacheEnvelope {
  data: FeedResponse;
  cachedAt: number;
  ttl: number;
}

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
  feedsTotal: number;
  fetchedAt: string;
  fromCache: boolean;
  partial: boolean;
}

// ─── Time-budgeted batch fetcher ────────────────────────────────────────
// Fetches as many feeds as possible within the time budget, starting with
// the highest-priority feeds (tier-sorted). Stops early when budget runs out.
async function fetchFeedsWithBudget(
  feeds: typeof ALL_FEEDS,
  budgetMs: number
): Promise<{ items: NewsItem[]; loaded: number; failed: number; complete: boolean }> {
  const items: NewsItem[] = [];
  let loaded = 0;
  let failed = 0;
  const start = Date.now();

  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    const elapsed = Date.now() - start;
    // Stop 1s before budget to leave room for clustering + response
    if (elapsed >= budgetMs - 1_000) {
      console.log(`[news/feeds] Budget exhausted at ${elapsed}ms, processed ${loaded + failed}/${feeds.length} feeds`);
      break;
    }

    const batch = feeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((feed) => fetchSingleFeed(feed))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.length > 0) {
        items.push(...result.value);
        loaded++;
      } else {
        failed++;
      }
    }
  }

  return { items, loaded, failed, complete: (loaded + failed) >= feeds.length };
}

// ─── Assemble response from raw items ───────────────────────────────────
function assembleResponse(
  items: NewsItem[],
  feedsLoaded: number,
  feedsFailed: number,
  partial: boolean,
): FeedResponse {
  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    const key = item.title.toLowerCase().trim().replace(/\s+/g, " ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const cutoff = Date.now() - 72 * 60 * 60 * 1000;
  const recent = deduped.filter((item) => item.pubDate.getTime() > cutoff);
  const clusters = clusterNews(recent.slice(0, MAX_TOTAL_ITEMS));

  console.log(
    `[news/feeds] ${partial ? "PARTIAL" : "FULL"}: ` +
    `${feedsLoaded}/${ALL_FEEDS.length} feeds, ${feedsFailed} failed, ` +
    `${items.length} raw → ${deduped.length} deduped → ${recent.length} recent → ` +
    `${clusters.length} clusters`
  );

  return {
    clusters: clusters.slice(0, MAX_CLUSTERS),
    totalItems: recent.length,
    feedsLoaded,
    feedsFailed,
    feedsTotal: ALL_FEEDS.length,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    partial,
  };
}

/** Write response to Redis cache */
async function writeCache(data: FeedResponse): Promise<void> {
  const envelope: CacheEnvelope = { data, cachedAt: Date.now(), ttl: CACHE_TTL };
  await setCachedJson(CACHE_KEY, envelope, CACHE_GRACE);
}

/** Background refresh — called via after(), respects time budget */
async function backgroundRefresh(): Promise<void> {
  try {
    const { items, loaded, failed, complete } = await fetchFeedsWithBudget(ALL_FEEDS, AFTER_BUDGET_MS);
    if (items.length > 0) {
      const response = assembleResponse(items, loaded, failed, !complete);
      await writeCache(response);
      console.log(`[news/feeds] after() refreshed cache: ${loaded} feeds, ${items.length} items`);
    }
  } catch (err) {
    console.warn("[news/feeds] after() refresh failed:", err instanceof Error ? err.message : err);
  }
}

function jsonResponse(data: FeedResponse | (FeedResponse & { fromCache: boolean }), source: string) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Data-Source": source,
      "X-Fetched-At": data.fetchedAt,
      "X-Feeds-Loaded": String(data.feedsLoaded),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const forceRefresh = searchParams.get("force") === "true";

    // ─── 1. Try cache first (unless force refresh) ────────────────────
    if (!forceRefresh) {
      const envelope = await getCachedJson<CacheEnvelope>(CACHE_KEY);

      if (envelope?.data != null && envelope.cachedAt) {
        const ageMs = Date.now() - envelope.cachedAt;
        const ttlMs = (envelope.ttl || CACHE_TTL) * 1_000;
        const graceMs = CACHE_GRACE * 1_000;

        if (ageMs < ttlMs) {
          // FRESH cache — return immediately, no background work
          return jsonResponse({ ...envelope.data, fromCache: true }, "cache-fresh");
        }

        if (ageMs < graceMs) {
          // STALE but within grace — return stale data instantly,
          // then use after() to refresh in background.
          // Since response is instant (~100ms), after() gets ~9.9s on Hobby.
          after(backgroundRefresh);
          return jsonResponse({ ...envelope.data, fromCache: true }, "cache-swr");
        }

        // Past grace — fall through to fresh fetch
        console.log(`[news/feeds] Cache expired (age: ${Math.round(ageMs / 1000)}s), fetching fresh`);
      }
    }

    // ─── 2. No cache / expired / force — time-budgeted inline fetch ───
    // Fetches highest-priority feeds first, stops when budget runs out.
    // On Hobby (10s limit), this gets tier 1-2 feeds (~100 feeds).
    const { items, loaded, failed, complete } = await fetchFeedsWithBudget(ALL_FEEDS, FETCH_BUDGET_MS);

    if (items.length === 0) {
      // Nothing at all — return 503 so client retries
      return NextResponse.json(
        {
          clusters: [], totalItems: 0, feedsLoaded: 0,
          feedsFailed: ALL_FEEDS.length, feedsTotal: ALL_FEEDS.length,
          fetchedAt: new Date().toISOString(), fromCache: false, partial: true,
          error: "No feeds available — retrying on next poll",
        },
        { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } }
      );
    }

    const response = assembleResponse(items, loaded, failed, !complete);
    // Cache whatever we got (even partial) so next request is instant
    await writeCache(response);

    // If partial, schedule after() to continue fetching remaining feeds
    if (!complete) {
      after(backgroundRefresh);
    }

    return jsonResponse(response, complete ? "fresh-full" : "fresh-partial");
  } catch (err) {
    console.error("[api/news/feeds] fatal:", err);
    return NextResponse.json(
      {
        clusters: [], totalItems: 0, feedsLoaded: 0,
        feedsFailed: ALL_FEEDS.length, feedsTotal: ALL_FEEDS.length,
        fetchedAt: new Date().toISOString(), fromCache: false, partial: true,
        error: "Internal error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
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
