import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/groq";
import { PROMPTS } from "@/lib/ai/prompts";
import { cachedFetch } from "@/lib/cache/redis";

const CACHE_KEY = "wv:ai:brief";
const CACHE_TTL = 3600; // 1 hour

interface BriefResponse {
  brief: string;
  generatedAt: string;
}

export async function POST(request: Request) {
  try {
    const { headlines } = (await request.json()) as { headlines: string[] };

    if (!headlines || headlines.length === 0) {
      return NextResponse.json({ error: "No headlines provided" }, { status: 400 });
    }

    const headlinesKey = headlines.slice(0, 5).join("|").slice(0, 200);
    const cacheKey = `${CACHE_KEY}:${Buffer.from(headlinesKey).toString("base64").slice(0, 32)}`;

    const cached = await cachedFetch<BriefResponse>(cacheKey, CACHE_TTL, async () => {
      const brief = await generateCompletion(
        PROMPTS.worldBrief.system,
        PROMPTS.worldBrief.user(headlines.slice(0, 30)),
        { maxTokens: 1500, temperature: 0.3 }
      );

      if (!brief) return null;

      return {
        brief,
        generatedAt: new Date().toISOString(),
      };
    });

    if (!cached) {
      return NextResponse.json(
        { error: "AI service unavailable", brief: null },
        { status: 503 }
      );
    }

    return NextResponse.json(cached);
  } catch (err) {
    console.error("[api/ai/summarize] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
