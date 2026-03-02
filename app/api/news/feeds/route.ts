import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { FEEDS, INTEL_FEEDS } from "@/lib/data/feeds";

const ALL_FEEDS = [...FEEDS, ...INTEL_FEEDS];
import { clusterNews } from "@/lib/services/clustering";
import { cachedFetch } from "@/lib/cache/redis";
import type { NewsItem, ClusteredEvent } from "@/lib/types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const FEED_TIMEOUT_MS = 8000;
const CACHE_KEY = "gt:news:feeds";
const CACHE_TTL = 120; // 2 minutes — fast refresh for live feed

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

function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

function extractImageUrl(item: RSSItem): string | undefined {
  return item["media:content"]?.["@_url"] || item.enclosure?.["@_url"];
}

async function fetchSingleFeed(feed: typeof FEEDS[number]): Promise<NewsItem[]> {
  try {
    const resp = await fetch(feed.url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { "User-Agent": "GeoTrack/1.0" },
      next: { revalidate: 60 },
    });

    if (!resp.ok) return [];

    const xml = await resp.text();
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) return [];

    const rawItems: RSSItem[] = channel.item || channel.entry || [];
    const itemList = Array.isArray(rawItems) ? rawItems : [rawItems];

    return itemList
      .filter((item) => item.title && (item.link || item.guid))
      .slice(0, 20)
      .map((item): NewsItem => {
        const title = typeof item.title === "string" ? item.title.trim() : String(item.title ?? "");
        let link = "";
        if (typeof item.link === "string") link = item.link;
        else if (item.link && typeof item.link === "object") link = item.link["@_href"] ?? "";
        else if (item.guid) link = item.guid;

        return {
          source: feed.name,
          title,
          link,
          pubDate: parseDate(item.pubDate || item.published || item.updated),
          isAlert: false,
          tier: feed.tier,
          category: feed.category,
          imageUrl: extractImageUrl(item),
        };
      });
  } catch {
    return [];
  }
}

async function fetchAllFeeds(): Promise<{ clusters: ClusteredEvent[]; totalItems: number; feedsLoaded: number }> {
  const feedResults = await Promise.allSettled(
    ALL_FEEDS.map((feed) => fetchSingleFeed(feed))
  );

  const allItems: NewsItem[] = [];
  let feedsLoaded = 0;

  for (const result of feedResults) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allItems.push(...result.value);
      feedsLoaded++;
    }
  }

  // Deduplicate by title similarity (exact match)
  const seen = new Set<string>();
  const deduped = allItems.filter((item) => {
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date
  deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const clusters = clusterNews(deduped.slice(0, 500));

  return {
    clusters: clusters.slice(0, 100),
    totalItems: deduped.length,
    feedsLoaded,
  };
}

export async function GET() {
  try {
    type FeedResponse = { clusters: ClusteredEvent[]; totalItems: number; feedsLoaded: number };
    const data = await cachedFetch<FeedResponse>(CACHE_KEY, CACHE_TTL, fetchAllFeeds);

    if (!data) {
      const fresh = await fetchAllFeeds();
      return NextResponse.json(fresh);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/news/feeds] error:", err);
    return NextResponse.json(
      { clusters: [], totalItems: 0, feedsLoaded: 0, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
