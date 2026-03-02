import type { NewsItem, ClusteredEvent, ThreatClassification, VelocityMetrics } from "@/lib/types";
import { classifyByKeyword, aggregateThreats } from "./threat-classifier";
import { getSourceTier } from "@/lib/data/feeds";
import { ALERT_KEYWORDS } from "@/lib/data/feeds";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "shall", "can", "need",
  "it", "its", "this", "that", "these", "those", "i", "you", "he",
  "she", "we", "they", "what", "which", "who", "whom", "how", "when",
  "where", "why", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "not", "only", "same", "so", "than",
  "too", "very", "just", "also", "now", "new", "says", "said", "after",
]);

const SIMILARITY_THRESHOLD = 0.5;

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) {
    if (b.has(x)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function isAlert(title: string): boolean {
  const lower = title.toLowerCase();
  return ALERT_KEYWORDS.some((kw) => lower.includes(kw));
}

function computeVelocity(items: NewsItem[]): VelocityMetrics {
  const now = Date.now();
  const oneHourAgo = now - 3600_000;
  const recentItems = items.filter((i) => i.pubDate.getTime() > oneHourAgo);
  const sourcesPerHour = recentItems.length;

  let level: VelocityMetrics["level"] = "normal";
  if (sourcesPerHour >= 5) level = "spike";
  else if (sourcesPerHour >= 2) level = "elevated";

  const allTimes = items.map((i) => i.pubDate.getTime()).sort();
  let trend: VelocityMetrics["trend"] = "stable";
  if (allTimes.length >= 3) {
    const mid = Math.floor(allTimes.length / 2);
    const firstHalf = allTimes.slice(0, mid);
    const secondHalf = allTimes.slice(mid);
    const firstAvgGap = firstHalf.length > 1
      ? (firstHalf[firstHalf.length - 1]! - firstHalf[0]!) / firstHalf.length
      : Infinity;
    const secondAvgGap = secondHalf.length > 1
      ? (secondHalf[secondHalf.length - 1]! - secondHalf[0]!) / secondHalf.length
      : Infinity;
    if (secondAvgGap < firstAvgGap * 0.7) trend = "rising";
    else if (secondAvgGap > firstAvgGap * 1.3) trend = "falling";
  }

  return {
    sourcesPerHour,
    level,
    trend,
    sentiment: "neutral",
    sentimentScore: 0,
  };
}

export function clusterNews(items: NewsItem[]): ClusteredEvent[] {
  if (items.length === 0) return [];

  for (const item of items) {
    if (!item.threat) {
      item.threat = classifyByKeyword(item.title);
    }
    if (!item.tier) {
      item.tier = getSourceTier(item.source);
    }
    item.isAlert = item.isAlert || isAlert(item.title);
  }

  const tokenized = items.map((item) => ({
    item,
    tokens: tokenize(item.title),
  }));

  const clusters: number[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < tokenized.length; i++) {
    if (assigned.has(i)) continue;
    const cluster = [i];
    assigned.add(i);

    for (let j = i + 1; j < tokenized.length; j++) {
      if (assigned.has(j)) continue;
      const sim = jaccardSimilarity(tokenized[i]!.tokens, tokenized[j]!.tokens);
      if (sim >= SIMILARITY_THRESHOLD) {
        cluster.push(j);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  const result: ClusteredEvent[] = clusters.map((indices) => {
    const clusterItems = indices.map((i) => items[i]!);

    clusterItems.sort((a, b) => {
      const tierDiff = (a.tier ?? 4) - (b.tier ?? 4);
      if (tierDiff !== 0) return tierDiff;
      return b.pubDate.getTime() - a.pubDate.getTime();
    });

    const primary = clusterItems[0]!;
    const allDates = clusterItems.map((i) => i.pubDate.getTime());
    const firstSeen = new Date(Math.min(...allDates));
    const lastUpdated = new Date(Math.max(...allDates));

    const topSources = clusterItems.slice(0, 5).map((i) => ({
      name: i.source,
      tier: i.tier ?? 4,
      url: i.link,
    }));

    const threat = aggregateThreats(clusterItems);
    const velocity = computeVelocity(clusterItems);

    const categoryVotes: Record<string, number> = {};
    for (const ci of clusterItems) {
      if (ci.category) categoryVotes[ci.category] = (categoryVotes[ci.category] ?? 0) + 1;
    }
    const topCategory = Object.entries(categoryVotes).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      id: `cluster-${primary.pubDate.getTime()}-${indices[0]}`,
      primaryTitle: primary.title,
      primarySource: primary.source,
      primaryLink: primary.link,
      sourceCount: clusterItems.length,
      topSources,
      allItems: clusterItems,
      firstSeen,
      lastUpdated,
      isAlert: clusterItems.some((i) => i.isAlert),
      category: topCategory ?? primary.category,
      velocity,
      threat,
    };
  });

  result.sort((a, b) => {
    const threatDiff = (b.threat ? { critical: 5, high: 4, medium: 3, low: 2, info: 1 }[b.threat.level] : 0)
      - (a.threat ? { critical: 5, high: 4, medium: 3, low: 2, info: 1 }[a.threat.level] : 0);
    if (threatDiff !== 0) return threatDiff;
    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
  });

  return result;
}
