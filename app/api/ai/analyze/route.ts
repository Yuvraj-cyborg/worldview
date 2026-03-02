import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/groq";

export async function POST(request: Request) {
  try {
    const { country, context, headlines } = await request.json();

    if (!country) {
      return NextResponse.json({ error: "Country required" }, { status: 400 });
    }

    const headlineContext = headlines?.length
      ? `\n\nRecent headlines about ${country}:\n${headlines.slice(0, 15).map((h: string) => `- ${h}`).join("\n")}`
      : "";

    const prompt = `You are a geopolitical intelligence analyst. Provide a concise intelligence brief for ${country}.

${context ? `Additional context: ${context}` : ""}
${headlineContext}

Structure your analysis:
1. **Current Situation** (2-3 sentences)
2. **Key Threats & Risks** (bullet points)
3. **Recent Developments** (based on headlines if available)
4. **Outlook** (1-2 sentences)

Be factual, analytical, and concise. No speculation without evidence.`;

    const analysis = await generateCompletion(prompt, { maxTokens: 800 });

    return NextResponse.json({ analysis, country });
  } catch (err) {
    console.error("[api/ai/analyze]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
