import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai/groq";

export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const prompt = `Classify this news headline for threat level and category.

Title: ${title}
${description ? `Description: ${description}` : ""}

Respond in JSON only:
{
  "level": "critical|high|medium|low|info",
  "category": "conflict|protest|disaster|diplomatic|economic|terrorism|cyber|health|environmental|military|crime|tech|general",
  "confidence": 0.0-1.0,
  "reasoning": "one sentence"
}`;

    const result = await generateCompletion(prompt, { maxTokens: 200 });

    try {
      const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        level: parsed.level ?? "info",
        category: parsed.category ?? "general",
        confidence: parsed.confidence ?? 0.5,
        reasoning: parsed.reasoning ?? "",
        source: "llm",
      });
    } catch {
      return NextResponse.json({
        level: "info",
        category: "general",
        confidence: 0.3,
        reasoning: "LLM response could not be parsed",
        source: "fallback",
      });
    }
  } catch (err) {
    console.error("[api/ai/classify]", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
