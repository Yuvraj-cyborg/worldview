import Groq from "groq-sdk";

let client: Groq | null = null;

function getClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export async function generateCompletion(
  promptOrSystem: string,
  userPromptOrOptions?: string | { maxTokens?: number; temperature?: number },
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const groq = getClient();
  if (!groq) return "";

  let messages: Array<{ role: "system" | "user"; content: string }>;
  let opts: { maxTokens?: number; temperature?: number };

  if (typeof userPromptOrOptions === "string") {
    messages = [
      { role: "system", content: promptOrSystem },
      { role: "user", content: userPromptOrOptions },
    ];
    opts = options ?? {};
  } else {
    messages = [{ role: "user", content: promptOrSystem }];
    opts = userPromptOrOptions ?? {};
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.3,
    });

    return response.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[groq] completion failed:", err);
    return "";
  }
}
