export type ThreatLevel = "critical" | "high" | "medium" | "low" | "info";

export type EventCategory =
  | "conflict"
  | "protest"
  | "disaster"
  | "diplomatic"
  | "economic"
  | "terrorism"
  | "cyber"
  | "health"
  | "environmental"
  | "military"
  | "crime"
  | "infrastructure"
  | "tech"
  | "general";

export interface ThreatClassification {
  level: ThreatLevel;
  category: EventCategory;
  confidence: number;
  source: "keyword" | "llm";
}

export type VelocityLevel = "normal" | "elevated" | "spike";
export type SentimentType = "negative" | "neutral" | "positive";

export interface VelocityMetrics {
  sourcesPerHour: number;
  level: VelocityLevel;
  trend: "rising" | "stable" | "falling";
  sentiment: SentimentType;
  sentimentScore: number;
}

export interface NewsItem {
  source: string;
  title: string;
  link: string;
  pubDate: Date;
  isAlert: boolean;
  tier?: number;
  category?: string;
  threat?: ThreatClassification;
  lat?: number;
  lon?: number;
  locationName?: string;
  imageUrl?: string;
}

export interface ClusteredEvent {
  id: string;
  primaryTitle: string;
  primarySource: string;
  primaryLink: string;
  sourceCount: number;
  topSources: Array<{ name: string; tier: number; url: string }>;
  allItems: NewsItem[];
  firstSeen: Date;
  lastUpdated: Date;
  isAlert: boolean;
  category?: string;
  velocity?: VelocityMetrics;
  threat?: ThreatClassification;
}

export type EscalationTrend = "escalating" | "stable" | "de-escalating";

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  keywords: string[];
  subtext?: string;
  location?: string;
  level?: "low" | "elevated" | "high";
  escalationScore?: 1 | 2 | 3 | 4 | 5;
  escalationTrend?: EscalationTrend;
  escalationIndicators?: string[];
  whyItMatters?: string;
}

export interface CountryScore {
  code: string;
  name: string;
  score: number;
  level: "low" | "normal" | "elevated" | "high" | "critical";
  trend: "rising" | "stable" | "falling";
  change24h: number;
  components: ComponentScores;
  lastUpdated: Date;
}

export interface ComponentScores {
  unrest: number;
  conflict: number;
  security: number;
  information: number;
}

export type SignalType =
  | "internet_outage"
  | "military_flight"
  | "protest"
  | "satellite_fire"
  | "temporal_anomaly"
  | "active_strike"
  | "conflict";

export interface GeoSignal {
  type: SignalType;
  country: string;
  countryName: string;
  lat: number;
  lon: number;
  severity: "low" | "medium" | "high";
  title: string;
  timestamp: Date;
}

export interface CountrySignalCluster {
  country: string;
  countryName: string;
  signals: GeoSignal[];
  signalTypes: Set<SignalType>;
  totalCount: number;
  highSeverityCount: number;
  convergenceScore: number;
}

export interface RegionalConvergence {
  region: string;
  countries: string[];
  signalTypes: SignalType[];
  totalSignals: number;
  description: string;
}

export interface SignalSummary {
  timestamp: Date;
  totalSignals: number;
  byType: Partial<Record<SignalType, number>>;
  convergenceZones: RegionalConvergence[];
  topCountries: CountrySignalCluster[];
  aiContext: string;
}

export type FocalPointUrgency = "watch" | "elevated" | "critical";

export interface HeadlineWithUrl {
  title: string;
  url: string;
}

export interface EntityMention {
  entityId: string;
  entityType: "country" | "company" | "index" | "commodity" | "crypto" | "sector";
  displayName: string;
  mentionCount: number;
  avgConfidence: number;
  clusterIds: string[];
  topHeadlines: HeadlineWithUrl[];
}

export interface FocalPoint {
  id: string;
  entityId: string;
  entityType: "country" | "company" | "index" | "commodity" | "crypto" | "sector";
  displayName: string;
  newsMentions: number;
  newsVelocity: number;
  topHeadlines: HeadlineWithUrl[];
  signalTypes: string[];
  signalCount: number;
  highSeverityCount: number;
  signalDescriptions: string[];
  focalScore: number;
  urgency: FocalPointUrgency;
  narrative: string;
  correlationEvidence: string[];
}

export interface FocalPointSummary {
  timestamp: Date;
  focalPoints: FocalPoint[];
  aiContext: string;
  topCountries: FocalPoint[];
  topCompanies: FocalPoint[];
}

export interface MarketData {
  symbol: string;
  name: string;
  display: string;
  price: number | null;
  change: number | null;
  sparkline?: number[];
}

export interface CryptoData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  sparkline?: number[];
}

export interface Feed {
  name: string;
  url: string;
  category?: string;
  region?: string;
  tier?: number;
}

export type EntityType = "company" | "index" | "commodity" | "crypto" | "sector" | "country";

export interface EntityEntry {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  keywords: string[];
  sector?: string;
  related?: string[];
}
