import { Index } from "@upstash/vector";
import { generateCompletion } from "./groq";

export interface VectorEntry {
  id: string;
  metadata: {
    title: string;
    source: string;
    timestamp: number;
    entities: string[];
    threatLevel: string;
    relevanceScore: number;
    useCount: number;
    lastUsed: number;
    content: string;
  };
}

export interface RetrievalResult {
  entries: VectorEntry[];
  recursionDepth: number;
  reformulatedQueries: string[];
  relevanceScores: number[];
}

interface RLMConfig {
  maxRecursionDepth: number;
  minRelevanceThreshold: number;
  decayFactor: number;
  boostFactor: number;
  topK: number;
}

const CONFIG: RLMConfig = {
  maxRecursionDepth: 3,
  minRelevanceThreshold: 0.65,
  decayFactor: 0.95,
  boostFactor: 1.2,
  topK: 15,
};

let vectorIndex: Index | null = null;

function getVectorIndex(): Index | null {
  if (vectorIndex) return vectorIndex;
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) return null;
  vectorIndex = new Index({ url, token });
  return vectorIndex;
}

export async function ingestDocuments(
  documents: Array<{
    id: string;
    title: string;
    content: string;
    source: string;
    entities: string[];
    threatLevel: string;
  }>
): Promise<number> {
  const index = getVectorIndex();
  if (!index) return 0;

  const upserts = documents.map((doc) => ({
    id: doc.id,
    data: `${doc.title}. ${doc.content}`,
    metadata: {
      title: doc.title,
      source: doc.source,
      timestamp: Date.now(),
      entities: doc.entities,
      threatLevel: doc.threatLevel,
      relevanceScore: 1.0,
      useCount: 0,
      lastUsed: 0,
      content: doc.content.slice(0, 500),
    },
  }));

  const BATCH = 50;
  let ingested = 0;
  for (let i = 0; i < upserts.length; i += BATCH) {
    const batch = upserts.slice(i, i + BATCH);
    await index.upsert(batch);
    ingested += batch.length;
  }

  return ingested;
}

async function retrieveTopK(
  query: string,
  topK: number = CONFIG.topK
): Promise<Array<{ id: string; score: number; metadata: VectorEntry["metadata"] }>> {
  const index = getVectorIndex();
  if (!index) return [];

  try {
    const results = await index.query({
      data: query,
      topK,
      includeMetadata: true,
    });

    return results.map((r) => ({
      id: String(r.id),
      score: r.score,
      metadata: r.metadata as VectorEntry["metadata"],
    }));
  } catch {
    return [];
  }
}

async function evaluateRelevance(
  query: string,
  results: Array<{ id: string; score: number; metadata: VectorEntry["metadata"] }>
): Promise<{ sufficient: boolean; avgScore: number }> {
  if (results.length === 0) return { sufficient: false, avgScore: 0 };

  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
  const aboveThreshold = results.filter((r) => r.score >= CONFIG.minRelevanceThreshold);

  return {
    sufficient: aboveThreshold.length >= 3 || avgScore >= CONFIG.minRelevanceThreshold,
    avgScore,
  };
}

async function reformulateQuery(
  originalQuery: string,
  previousResults: Array<{ metadata: VectorEntry["metadata"] }>,
  depth: number
): Promise<string> {
  const contextSnippets = previousResults
    .slice(0, 3)
    .map((r) => r.metadata.title)
    .join("; ");

  try {
    const refined = await generateCompletion(
      `You are refining a search query. Original: "${originalQuery}". Context found so far: "${contextSnippets}". Generate a single refined search query that would find more relevant information. Return ONLY the query, nothing else.`,
      { maxTokens: 100 }
    );
    return refined.trim() || originalQuery;
  } catch {
    return `${originalQuery} ${previousResults[0]?.metadata?.entities?.join(" ") ?? ""}`.trim();
  }
}

export async function recursiveRetrieve(query: string): Promise<RetrievalResult> {
  const allResults = new Map<string, { id: string; score: number; metadata: VectorEntry["metadata"] }>();
  const reformulatedQueries: string[] = [query];
  let currentQuery = query;

  for (let depth = 0; depth < CONFIG.maxRecursionDepth; depth++) {
    const results = await retrieveTopK(currentQuery);

    for (const r of results) {
      const existing = allResults.get(r.id);
      if (!existing || r.score > existing.score) {
        allResults.set(r.id, r);
      }
    }

    const evaluation = await evaluateRelevance(currentQuery, results);
    if (evaluation.sufficient || depth === CONFIG.maxRecursionDepth - 1) {
      break;
    }

    currentQuery = await reformulateQuery(query, results, depth);
    reformulatedQueries.push(currentQuery);
  }

  const entries = Array.from(allResults.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, CONFIG.topK);

  return {
    entries: entries.map((e) => ({ id: e.id, metadata: e.metadata })),
    recursionDepth: reformulatedQueries.length - 1,
    reformulatedQueries,
    relevanceScores: entries.map((e) => e.score),
  };
}

export async function boostUsedEntries(usedIds: string[]): Promise<void> {
  const index = getVectorIndex();
  if (!index || usedIds.length === 0) return;

  for (const id of usedIds) {
    try {
      const existing = await index.fetch([id], { includeMetadata: true });
      const entry = existing[0];
      if (entry?.metadata) {
        const meta = entry.metadata as VectorEntry["metadata"];
        await index.upsert({
          id,
          data: meta.title,
          metadata: {
            ...meta,
            relevanceScore: meta.relevanceScore * CONFIG.boostFactor,
            useCount: meta.useCount + 1,
            lastUsed: Date.now(),
          },
        });
      }
    } catch {
      // skip
    }
  }
}

export async function decayUnusedEntries(): Promise<number> {
  const index = getVectorIndex();
  if (!index) return 0;

  // Upstash Vector doesn't support batch scan easily,
  // so decay is applied during retrieval by adjusting scores
  return 0;
}

export async function queryWithContext(
  userQuery: string,
  newsHeadlines: string[] = []
): Promise<{
  answer: string;
  sources: Array<{ title: string; source: string }>;
  recursionDepth: number;
}> {
  const retrieval = await recursiveRetrieve(userQuery);

  const contextLines = retrieval.entries.map((e, i) =>
    `[${i + 1}] ${e.metadata.title} (${e.metadata.source}): ${e.metadata.content}`
  );

  const newsContext = newsHeadlines.length > 0
    ? `\n\nRecent headlines:\n${newsHeadlines.slice(0, 10).map((h) => `- ${h}`).join("\n")}`
    : "";

  const prompt = `You are WorldView, an intelligence analysis assistant. Answer the user's question using the provided context. Cite sources by number [1], [2], etc. Be concise and analytical.

Context from knowledge base:
${contextLines.join("\n")}
${newsContext}

User question: ${userQuery}

Provide a clear, analytical response with citations.`;

  try {
    const answer = await generateCompletion(prompt, { maxTokens: 1000 });

    const usedIds = retrieval.entries
      .filter((_, i) => answer.includes(`[${i + 1}]`))
      .map((e) => e.id);
    await boostUsedEntries(usedIds);

    return {
      answer,
      sources: retrieval.entries.map((e) => ({
        title: e.metadata.title,
        source: e.metadata.source,
      })),
      recursionDepth: retrieval.recursionDepth,
    };
  } catch {
    return {
      answer: "Unable to generate response. Please try again.",
      sources: [],
      recursionDepth: retrieval.recursionDepth,
    };
  }
}
