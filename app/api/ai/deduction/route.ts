import { NextResponse } from "next/server";
import { queryWithContext } from "@/lib/ai/rlm";
import { generateCompletion } from "@/lib/ai/groq";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    let headlines: string[] = [];
    try {
      const baseUrl = new URL(request.url).origin;
      const newsResp = await fetch(`${baseUrl}/api/news/feeds`, { signal: AbortSignal.timeout(5000) });
      if (newsResp.ok) {
        const newsData = await newsResp.json();
        headlines = (newsData.clusters ?? [])
          .slice(0, 20)
          .map((c: { primaryTitle: string }) => c.primaryTitle);
      }
    } catch { /* continue without news */ }

    // Try RLM first (if vector DB configured)
    try {
      const rlmResult = await queryWithContext(query, headlines);
      if (rlmResult.answer && !rlmResult.answer.includes("Unable to generate")) {
        return NextResponse.json({
          answer: rlmResult.answer,
          sources: rlmResult.sources,
          method: "rlm",
          recursionDepth: rlmResult.recursionDepth,
        });
      }
    } catch { /* fall through to direct LLM */ }

    // Fallback: direct LLM with news context
    const newsContext = headlines.length > 0
      ? `\n\nCurrent headlines:\n${headlines.map((h) => `- ${h}`).join("\n")}`
      : "";

    const answer = await generateCompletion(
      `You are GeoTrack, an intelligence analysis assistant with access to current news. Answer the user's question analytically and concisely, referencing relevant current events.
${newsContext}

User: ${query}`,
      { maxTokens: 800 }
    );

    return NextResponse.json({
      answer,
      sources: headlines.slice(0, 5).map((h) => ({ title: h, source: "Live News" })),
      method: "direct-llm",
    });
  } catch (err) {
    console.error("[api/ai/deduction]", err);
    return NextResponse.json({ error: "Deduction failed" }, { status: 500 });
  }
}
