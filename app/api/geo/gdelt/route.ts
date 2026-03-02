import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const revalidate = 300;

const TOPIC_QUERIES: Record<string, { gdelt: string; gnews: string }> = {
  conflict: {
    gdelt: "conflict OR war OR military attack OR airstrike",
    gnews: "war+OR+conflict+OR+airstrike+OR+military+attack",
  },
  protest: {
    gdelt: "protest OR demonstration OR unrest OR riot",
    gnews: "protest+OR+demonstration+OR+unrest+OR+riot",
  },
  military: {
    gdelt: "military OR armed forces OR troops OR navy",
    gnews: "military+OR+armed+forces+OR+troops+OR+navy",
  },
  terrorism: {
    gdelt: "terrorism OR terrorist OR bombing OR extremism",
    gnews: "terrorism+OR+terrorist+OR+bombing+OR+extremism",
  },
  diplomacy: {
    gdelt: "diplomacy OR summit OR negotiations OR treaty",
    gnews: "diplomacy+OR+summit+OR+negotiations+OR+sanctions",
  },
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function extractStr(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (o["#text"]) return String(o["#text"]).trim();
    if (o["@_url"]) return String(o["@_url"]).trim();
    if (o["@_href"]) return String(o["@_href"]).trim();
  }
  return "";
}

async function fetchGdelt(query: string): Promise<{ articles: Article[]; source: string } | null> {
  try {
    const encoded = encodeURIComponent(query);
    const resp = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=ArtList&maxrecords=30&format=json&sort=DateDesc&timespan=24h`,
      { signal: AbortSignal.timeout(15000), next: { revalidate: 300 } }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.articles?.length) return null;

    return {
      source: "GDELT",
      articles: data.articles.map((a: Record<string, unknown>) => ({
        url: a.url as string,
        title: a.title as string,
        seenDate: (a.seendate as string) ?? new Date().toISOString(),
        domain: (a.domain as string) ?? "",
        language: (a.language as string) ?? "en",
        sourcecountry: (a.sourcecountry as string) ?? "",
        tone: typeof a.tone === "number" ? a.tone : 0,
      })),
    };
  } catch {
    return null;
  }
}

interface Article {
  url: string;
  title: string;
  seenDate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

async function fetchGoogleNewsFallback(query: string): Promise<{ articles: Article[]; source: string } | null> {
  try {
    const resp = await fetch(
      `https://news.google.com/rss/search?q=${query}+when:1d&hl=en-US&gl=US&ceid=US:en`,
      {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "GeoTrack/1.0" },
        next: { revalidate: 300 },
      }
    );
    if (!resp.ok) return null;
    const xml = await resp.text();
    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    if (!items) return null;
    const list = Array.isArray(items) ? items : [items];

    return {
      source: "Google News",
      articles: list.slice(0, 30).map((item: Record<string, unknown>): Article => {
        const title = extractStr(item.title);
        const link = extractStr(item.link);
        let domain = "";
        try { domain = new URL(link || "https://example.com").hostname.replace("www.", ""); } catch { /* */ }
        const sourceName = extractStr(item.source) || domain;
        return {
          url: link || "#",
          title: title ? title.replace(/ - .*$/, "").trim() : "Untitled",
          seenDate: extractStr(item.pubDate) || new Date().toISOString(),
          domain: sourceName || domain || "news",
          language: "en",
          sourcecountry: "",
          tone: 0,
        };
      }),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get("topic") ?? "conflict";
    const config = TOPIC_QUERIES[topic] ?? TOPIC_QUERIES.conflict!;

    // Try GDELT first, fall back to Google News RSS
    let result = await fetchGdelt(config.gdelt);

    if (!result || result.articles.length === 0) {
      result = await fetchGoogleNewsFallback(config.gnews);
    }

    if (!result || result.articles.length === 0) {
      return NextResponse.json({
        articles: [],
        count: 0,
        source: "none",
        note: "Intel sources temporarily unavailable",
      });
    }

    return NextResponse.json({
      articles: result.articles,
      count: result.articles.length,
      source: result.source,
    });
  } catch (err) {
    console.error("[api/geo/gdelt]", err);
    return NextResponse.json({
      articles: [],
      count: 0,
      note: "Intel sources temporarily unavailable",
    });
  }
}
