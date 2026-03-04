import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/groq";
import { cachedFetch } from "@/lib/cache/redis";
import { FEEDS, INTEL_FEEDS } from "@/lib/data/feeds";
import { XMLParser } from "fast-xml-parser";

export const revalidate = 300;

const CACHE_KEY = "gt:ai:intel-brief";
const CACHE_TTL = 300; // 5 minutes

interface IntelScene {
    title: string;
    summary: string;
    sources: string[];
    differences: string;
    threat: "↑" | "↓" | "→" | "⚠";
}
interface IntelBrief {
    scenes: IntelScene[];
    underreported: string[];
    generatedAt: string;
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

async function quickFetchHeadlines(): Promise<string[]> {
    // Pick a curated subset of high-value feeds to keep latency low
    const priority = [
        ...FEEDS.filter(f => (f.tier ?? 4) <= 2 && ["politics", "middleeast", "us"].includes(f.category ?? "")).slice(0, 12),
        ...INTEL_FEEDS.filter(f => ["defense", "intl"].includes(f.category ?? "")).slice(0, 6),
    ];

    const results = await Promise.allSettled(
        priority.map(async (feed) => {
            const resp = await fetch(feed.url, {
                signal: AbortSignal.timeout(4000),
                headers: { "User-Agent": "GeoTrack/1.0" },
                next: { revalidate: 120 },
            });
            if (!resp.ok) return [];
            const xml = await resp.text();
            const parsed = parser.parse(xml);
            const channel = parsed?.rss?.channel || parsed?.feed;
            if (!channel) return [];
            const items = Array.isArray(channel.item || channel.entry)
                ? (channel.item || channel.entry)
                : [channel.item || channel.entry].filter(Boolean);
            return items.slice(0, 5).map((item: Record<string, unknown>) => {
                const t = item.title;
                const title = typeof t === "string" ? t : String(t ?? "");
                return title.length > 15 ? `[${feed.name}] ${title.trim()}` : null;
            }).filter(Boolean) as string[];
        })
    );

    const headlines: string[] = [];
    for (const r of results) {
        if (r.status === "fulfilled") headlines.push(...r.value);
    }
    return headlines.slice(0, 50);
}

async function generateBrief(): Promise<IntelBrief> {
    const headlines = await quickFetchHeadlines();

    if (headlines.length === 0) {
        return { scenes: [], underreported: [], generatedAt: new Date().toISOString() };
    }

    const prompt = `You are an intelligence analyst. Analyze these news headlines from multiple sources and identify the major DEVELOPING STORIES.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "scenes": [
    {
      "title": "Short title for this story (max 10 words)",
      "summary": "What is happening — 2-3 sentences with key facts",
      "sources": ["Source1", "Source2"],
      "differences": "How sources differ in framing. Write 'Sources aligned' if they agree.",
      "threat": "↑ or ↓ or → or ⚠"
    }
  ],
  "underreported": ["Stories with few sources that warrant attention (max 2)"]
}

Rules: 4-6 scenes max, group by story not region, be factual, output ONLY JSON.`;

    try {
        const raw = await generateCompletion(prompt, { maxTokens: 1200, temperature: 0.2 });
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned) as IntelBrief;
        parsed.generatedAt = new Date().toISOString();
        return parsed;
    } catch (err) {
        console.error("[api/ai/intel-brief] parse error:", err);
        return { scenes: [], underreported: [], generatedAt: new Date().toISOString() };
    }
}

export async function GET() {
    try {
        const data = await cachedFetch<IntelBrief>(CACHE_KEY, CACHE_TTL, generateBrief);
        if (!data) {
            const fresh = await generateBrief();
            return NextResponse.json(fresh);
        }
        return NextResponse.json(data);
    } catch (err) {
        console.error("[api/ai/intel-brief] error:", err);
        return NextResponse.json(
            { scenes: [], underreported: [], generatedAt: new Date().toISOString() },
            { status: 500 }
        );
    }
}
