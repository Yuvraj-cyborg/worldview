import type { ThreatLevel, EventCategory, ThreatClassification } from "@/lib/types";

export const THREAT_PRIORITY: Record<ThreatLevel, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

type KeywordMap = Record<string, EventCategory>;

const CRITICAL_KEYWORDS: KeywordMap = {
  "nuclear strike": "military",
  "nuclear attack": "military",
  "nuclear war": "military",
  "invasion": "conflict",
  "declaration of war": "conflict",
  "declares war": "conflict",
  "all-out war": "conflict",
  "full-scale war": "conflict",
  "martial law": "military",
  "coup": "military",
  "coup attempt": "military",
  "genocide": "conflict",
  "ethnic cleansing": "conflict",
  "chemical attack": "terrorism",
  "biological attack": "terrorism",
  "mass casualty": "conflict",
  "pandemic declared": "health",
  "nato article 5": "military",
  "meltdown": "disaster",
  "nuclear meltdown": "disaster",
};

const HIGH_KEYWORDS: KeywordMap = {
  "war": "conflict",
  "armed conflict": "conflict",
  "airstrike": "conflict",
  "airstrikes": "conflict",
  "drone strike": "conflict",
  "missile": "military",
  "missile launch": "military",
  "troops deployed": "military",
  "military escalation": "military",
  "military operation": "military",
  "ground offensive": "military",
  "bombing": "conflict",
  "bombardment": "conflict",
  "shelling": "conflict",
  "casualties": "conflict",
  "killed in": "conflict",
  "hostage": "terrorism",
  "terrorist": "terrorism",
  "terror attack": "terrorism",
  "assassination": "crime",
  "cyber attack": "cyber",
  "ransomware": "cyber",
  "sanctions": "economic",
  "embargo": "economic",
  "earthquake": "disaster",
  "tsunami": "disaster",
  "hurricane": "disaster",
  "typhoon": "disaster",
  "explosions": "conflict",
  "ballistic missile": "military",
};

const MEDIUM_KEYWORDS: KeywordMap = {
  "protest": "protest",
  "protests": "protest",
  "riot": "protest",
  "riots": "protest",
  "unrest": "protest",
  "demonstration": "protest",
  "military exercise": "military",
  "arms deal": "military",
  "diplomatic crisis": "diplomatic",
  "ambassador recalled": "diplomatic",
  "trade war": "economic",
  "tariff": "economic",
  "recession": "economic",
  "inflation": "economic",
  "market crash": "economic",
  "flood": "disaster",
  "wildfire": "disaster",
  "volcano": "disaster",
  "eruption": "disaster",
  "outbreak": "health",
  "epidemic": "health",
  "blackout": "infrastructure",
  "power outage": "infrastructure",
  "internet outage": "infrastructure",
};

const LOW_KEYWORDS: KeywordMap = {
  "election": "diplomatic",
  "summit": "diplomatic",
  "treaty": "diplomatic",
  "negotiation": "diplomatic",
  "ceasefire": "diplomatic",
  "peace treaty": "diplomatic",
  "climate change": "environmental",
  "drought": "environmental",
  "vaccine": "health",
  "interest rate": "economic",
  "gdp": "economic",
  "unemployment": "economic",
};

const EXCLUSIONS = [
  "protein", "couples", "relationship", "dating", "diet", "fitness",
  "recipe", "cooking", "shopping", "fashion", "celebrity", "movie",
  "tv show", "sports", "game", "concert", "festival", "wedding",
  "vacation", "travel tips", "self-care", "wellness",
  "strikes deal", "strikes agreement", "strikes partnership",
];

const SHORT_KEYWORDS = new Set([
  "war", "coup", "ban", "vote", "riot", "riots", "hack", "talks", "gdp",
  "virus", "flood", "strikes",
]);

const keywordRegexCache = new Map<string, RegExp>();

function getKeywordRegex(kw: string): RegExp {
  let re = keywordRegexCache.get(kw);
  if (!re) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = SHORT_KEYWORDS.has(kw)
      ? new RegExp(`\\b${escaped}\\b`)
      : new RegExp(escaped);
    keywordRegexCache.set(kw, re);
  }
  return re;
}

function matchKeywords(
  titleLower: string,
  keywords: KeywordMap
): { keyword: string; category: EventCategory } | null {
  for (const [kw, cat] of Object.entries(keywords)) {
    if (getKeywordRegex(kw).test(titleLower)) {
      return { keyword: kw, category: cat };
    }
  }
  return null;
}

const ESCALATION_ACTIONS = /\b(attack|attacks|attacked|strike|strikes|struck|bomb|bombs|bombed|bombing|shell|shelled|shelling|missile|missiles|retaliates|killed|casualties|offensive|invaded|invades)\b/;
const ESCALATION_TARGETS = /\b(iran|tehran|russia|moscow|china|beijing|taiwan|taipei|north korea|pyongyang|nato|us base|us forces)\b/;

function shouldEscalateToCritical(lower: string, matchCat: EventCategory): boolean {
  if (matchCat !== "conflict" && matchCat !== "military") return false;
  return ESCALATION_ACTIONS.test(lower) && ESCALATION_TARGETS.test(lower);
}

export function classifyByKeyword(title: string): ThreatClassification {
  const lower = title.toLowerCase();

  if (EXCLUSIONS.some((ex) => lower.includes(ex))) {
    return { level: "info", category: "general", confidence: 0.3, source: "keyword" };
  }

  let match = matchKeywords(lower, CRITICAL_KEYWORDS);
  if (match) return { level: "critical", category: match.category, confidence: 0.9, source: "keyword" };

  match = matchKeywords(lower, HIGH_KEYWORDS);
  if (match) {
    if (shouldEscalateToCritical(lower, match.category)) {
      return { level: "critical", category: match.category, confidence: 0.85, source: "keyword" };
    }
    return { level: "high", category: match.category, confidence: 0.8, source: "keyword" };
  }

  match = matchKeywords(lower, MEDIUM_KEYWORDS);
  if (match) return { level: "medium", category: match.category, confidence: 0.7, source: "keyword" };

  match = matchKeywords(lower, LOW_KEYWORDS);
  if (match) return { level: "low", category: match.category, confidence: 0.6, source: "keyword" };

  return { level: "info", category: "general", confidence: 0.3, source: "keyword" };
}

export function aggregateThreats(
  items: Array<{ threat?: ThreatClassification; tier?: number }>
): ThreatClassification {
  const withThreat = items.filter((i) => i.threat);
  if (withThreat.length === 0) {
    return { level: "info", category: "general", confidence: 0.3, source: "keyword" };
  }

  let maxLevel: ThreatLevel = "info";
  let maxPriority = 0;
  for (const item of withThreat) {
    const p = THREAT_PRIORITY[item.threat!.level];
    if (p > maxPriority) {
      maxPriority = p;
      maxLevel = item.threat!.level;
    }
  }

  const catCounts = new Map<EventCategory, number>();
  for (const item of withThreat) {
    const cat = item.threat!.category;
    catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }
  let topCat: EventCategory = "general";
  let topCount = 0;
  for (const [cat, count] of catCounts) {
    if (count > topCount) {
      topCount = count;
      topCat = cat;
    }
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const item of withThreat) {
    const weight = item.tier ? 6 - Math.min(item.tier, 5) : 1;
    weightedSum += item.threat!.confidence * weight;
    weightTotal += weight;
  }

  return {
    level: maxLevel,
    category: topCat,
    confidence: weightTotal > 0 ? weightedSum / weightTotal : 0.5,
    source: "keyword",
  };
}
