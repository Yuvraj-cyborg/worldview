# WorldView — Architecture & Approach Document

> A next-generation global intelligence dashboard built on Next.js 16, React 19, and Tailwind CSS v4.
> Successor to [worldmonitor](../worldmonitor) — redesigned from scratch for stability, performance, and developer experience.

---

## Table of Contents

1. [Why WorldView](#1-why-worldview)
2. [What to Keep from WorldMonitor](#2-what-to-keep-from-worldmonitor)
3. [What to Drop](#3-what-to-drop)
4. [Core Architecture](#4-core-architecture)
5. [API Strategy — Minimal Friction](#5-api-strategy--minimal-friction)
6. [Data Layer — RLM (Recursive Learning Model)](#6-data-layer--rlm-recursive-learning-model)
7. [Frontend Architecture](#7-frontend-architecture)
8. [UI/UX Design Principles](#8-uiux-design-principles)
9. [State Management](#9-state-management)
10. [Caching Strategy](#10-caching-strategy)
11. [AI/ML Pipeline](#11-aiml-pipeline)
12. [Map & Visualization](#12-map--visualization)
13. [What to Copy from WorldMonitor](#13-what-to-copy-from-worldmonitor)
14. [Project Structure](#14-project-structure)
15. [Phase Roadmap](#15-phase-roadmap)
16. [Environment Variables](#16-environment-variables)
17. [Tech Stack Summary](#17-tech-stack-summary)

---

## 1. Why WorldView

WorldMonitor is powerful but has accumulated significant complexity:

| WorldMonitor Problem | WorldView Solution |
|---|---|
| **38 external APIs** — many redundant, some fragile (Yahoo Finance unofficial) | **12-15 curated APIs** — only reliable, free-tier-friendly sources |
| **Vanilla TypeScript, no framework** — 4,300-line `App.ts` monolith, imperative DOM updates | **Next.js 16 + React 19** — server components, suspense, declarative UI |
| **60+ Vercel Edge Functions** as individual JS files | **Next.js API Routes** with shared middleware, type-safe with proto-generated types |
| **5-tier caching** (Redis + CDN + Service Worker + IndexedDB + Persistent Cache) — over-engineered | **2-tier caching** (Redis + React cache/fetch) — simple and effective |
| **No RAG architecture** — basic keyword matching + Jaccard clustering | **RLM (Recursive Learning Model)** — recursive retrieval with learning feedback loops |
| **44 panels in full variant** — information overload | **8-12 focused views** — progressive disclosure, clean layout |
| **Class-based Panel system** with manual DOM manipulation | **React Server/Client Components** with proper composition |
| **All state in one App class** — no separation of concerns | **Zustand stores** — modular, predictable, debuggable |
| **150+ RSS feeds** fetched client-side with per-feed circuit breakers | **Server-side feed aggregation** with intelligent deduplication |
| **Desktop app via Tauri** — adds massive complexity | **Web-first PWA** — defer desktop until later |

---

## 2. What to Keep from WorldMonitor

These are the genuinely good ideas worth preserving:

### Core Concepts
- **Multi-source signal fusion** — correlating events across data types (conflicts, flights, outages, protests) to detect convergence
- **Country Instability Index (CII)** — composite risk scoring per country from multiple signal types
- **Focal Point Detection** — identifying entities where multiple intelligence streams converge
- **Temporal baseline anomaly detection** — Welford's algorithm for detecting statistical deviations
- **Entity extraction pipeline** — linking news to real-world entities (countries, companies, assets)
- **Threat classification** — keyword + LLM hybrid approach for severity scoring
- **Regional convergence scoring** — detecting when multiple signal types spike in the same geography

### Data Models (copy these)
- `NewsItem`, `ClusteredEvent`, `VelocityMetrics` — core news pipeline types
- `GeoSignal`, `CountrySignalCluster`, `RegionalConvergence`, `SignalSummary` — signal aggregation types
- `CountryScore`, `ComponentScores` — CII scoring types
- `FocalPoint`, `FocalPointSummary` — convergence detection types
- `Hotspot`, `DynamicEscalationScore` — geopolitical monitoring types
- `ConflictZone`, `MilitaryBase`, `MilitaryFlight` — military types
- `CyberThreat`, `InternetOutage` — infrastructure types
- `MapLayers` interface — layer toggle system

### Algorithms (port these)
- Jaccard similarity clustering (`clusterNews`)
- Convergence scoring algorithm
- CII computation with 4-component weighted blend
- Hotspot escalation scoring (news 0.35, CII 0.25, geo 0.25, military 0.15)
- Circuit breaker pattern for API resilience
- Z-score anomaly detection (thresholds: 1.5/2.0/3.0)

### API Patterns
- Domain allowlist for RSS proxy
- Graceful degradation (never hard-fail on missing credentials)
- Cache key hashing with DJB2
- IP-based rate limiting with sliding window

---

## 3. What to Drop

### APIs to Remove (23 APIs eliminated)

| API | Reason to Drop |
|---|---|
| **Wingbits** | Commercial/paid — not needed for MVP |
| **Cloudflare Radar** | Enterprise-only — replace with IODA (free) |
| **Yahoo Finance** | Unofficial, fragile — use Finnhub exclusively |
| **blockchain.info** | One niche signal — can derive from CoinGecko |
| **alternative.me (Fear & Greed)** | Crypto-specific niche — defer |
| **AbuseIPDB** | One of 5 cyber sources — keep the free 4 |
| **C2IntelFeeds** | GitHub-hosted, fragile |
| **AlienVault OTX** | Redundant with Feodo + URLhaus |
| **Feodo Tracker** | Can aggregate all cyber from one source later |
| **URLhaus** | Can aggregate all cyber from one source later |
| **FAA ASWS** | US-only airport status — too niche |
| **WorldPop** | Population exposure — nice but not core |
| **HDX HAPI** | Humanitarian — defer to later phase |
| **UNHCR** | Humanitarian — defer to later phase |
| **World Bank** | Development indicators — defer |
| **ArXiv** | Research papers — not core intelligence |
| **Hacker News** | Tech content — not core intelligence |
| **GitHub Trending** | Tech content — not core intelligence |
| **Tech Events** | Scraping — fragile and not core |
| **pizzint.watch** | Novelty OSINT — defer |
| **EIA** | Energy data — can add later |
| **NGA MSI** | Maritime warnings — niche |
| **Custom AIS Relay** | Self-hosted complexity — defer |

### Features to Remove
- **Tauri desktop app** — eliminates `src-tauri/`, sidecar, keychain, 5+ config files
- **Multiple variants** (tech, finance, happy) — build one great product first
- **150+ RSS feeds** — curate down to ~40-50 essential sources
- **22 live webcams** — streaming complexity, YouTube dependency
- **8+ live video streams** — YouTube iframe/HLS complexity
- **TV Mode** — nice-to-have, not core
- **Historical playback** — snapshots + IndexedDB complexity
- **Panel drag-and-drop reordering** — defer
- **Panel resizing** — defer (use fixed responsive grid)
- **16 language localizations** — start with English, add i18n framework for later
- **Service Worker / PWA offline** — add later
- **Custom AIS relay + chokepoint detection** — defer
- **OREF rocket alerts** — too niche
- **Telegram intelligence feed** — MTProto complexity
- **GPS/GNSS jamming** — niche
- **Gulf FDI investment layer** — niche
- **BIS central bank data** — niche
- **WTO trade policy** — niche

### Complexity to Remove
- **Protobuf/sebuf RPC system** — over-engineered for this stage; use tRPC or plain typed API routes
- **ML Web Worker** with ONNX Runtime — defer browser-side ML; use server-side AI
- **Convex backend** — not needed alongside Next.js API routes
- **5-tier caching** — simplify to 2 tiers

---

## 4. Core Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 16 App                    │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   React 19  │  │  API Routes  │  │  Server   │  │
│  │   Client    │  │  /api/*      │  │  Actions  │  │
│  │   Components│  │  (tRPC-like) │  │           │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                │                │         │
│  ┌──────┴────────────────┴────────────────┴─────┐  │
│  │              Data Layer                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │ Zustand  │  │ React    │  │ RLM Engine  │  │  │
│  │  │ Stores   │  │ Query /  │  │ (Recursive  │  │  │
│  │  │          │  │ SWR      │  │  Learning)  │  │  │
│  │  └─────────┘  └──────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────┐
│               External Services                      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Upstash  │ │ Groq /   │ │ 12-15    │ │ RSS    │  │
│  │ Redis    │ │ Ollama   │ │ APIs     │ │ Feeds  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
└──────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Next.js App Router** — Server Components by default, Client Components only where interactivity is needed
2. **Server-side data fetching** — All API calls happen server-side via Route Handlers or Server Actions; no direct external API calls from the browser
3. **React 19 features** — `use()` hook, Server Actions, streaming with Suspense boundaries
4. **Typed end-to-end** — Shared TypeScript types between API routes and components (no protobuf needed)
5. **Edge-first caching** — Next.js built-in `fetch` caching + Upstash Redis for cross-request dedup

---

## 5. API Strategy — Minimal Friction

### Tier 1: Core APIs (Always Active — 7 APIs)

| # | API | Purpose | Auth | Cost |
|---|-----|---------|------|------|
| 1 | **RSS Feeds (~40)** | News intelligence | None | Free |
| 2 | **ACLED** | Conflict & protest data | API Key | Free (researcher) |
| 3 | **UCDP** | Conflict events | None | Free |
| 4 | **GDELT** | Geopolitical events + geo | None | Free |
| 5 | **Groq** | Primary LLM (summarization, classification, analysis) | API Key | Free tier |
| 6 | **USGS** | Earthquakes | None | Free |
| 7 | **CoinGecko** | Crypto market data | None | Free |

### Tier 2: Enrichment APIs (Optional — 5 APIs)

| # | API | Purpose | Auth | Cost |
|---|-----|---------|------|------|
| 8 | **Finnhub** | Stock quotes, ETFs | API Key | Free |
| 9 | **FRED** | Economic indicators (treasury yields, rates) | API Key | Free |
| 10 | **NASA FIRMS** | Satellite fire detection | API Key | Free |
| 11 | **OpenSky** | Military flight tracking | None | Free |
| 12 | **OpenRouter** | Fallback LLM | API Key | Free (select models) |

### Tier 3: Future APIs (Add Later)

| API | Purpose | When |
|---|---|---|
| Polymarket | Prediction markets | Phase 2 |
| NOAA | Climate anomalies | Phase 2 |
| Status Pages | Service health | Phase 3 |
| Cloudflare Radar | Internet outages | Phase 3 (if enterprise) |
| EIA | Energy data | Phase 3 |
| UNHCR | Displacement | Phase 3 |

### API Route Organization

```
app/
└── api/
    ├── news/
    │   ├── feeds/route.ts        # Aggregated RSS fetch (replaces rss-proxy + feed-digest)
    │   └── classify/route.ts     # LLM classification
    ├── conflicts/
    │   ├── acled/route.ts        # ACLED events
    │   ├── ucdp/route.ts         # UCDP events
    │   └── summary/route.ts      # Conflict summary (merged ACLED + UCDP)
    ├── geo/
    │   ├── gdelt/route.ts        # GDELT doc + geo
    │   └── earthquakes/route.ts  # USGS earthquakes
    ├── markets/
    │   ├── stocks/route.ts       # Finnhub quotes
    │   ├── crypto/route.ts       # CoinGecko
    │   └── macro/route.ts        # FRED + composite signals
    ├── military/
    │   ├── flights/route.ts      # OpenSky military flights
    │   └── fires/route.ts        # NASA FIRMS
    ├── ai/
    │   ├── summarize/route.ts    # LLM summarization (Groq primary, OpenRouter fallback)
    │   ├── analyze/route.ts      # Country/event analysis
    │   └── classify/route.ts     # Threat classification
    └── intelligence/
        ├── cii/route.ts          # Country Instability Index
        ├── signals/route.ts      # Signal aggregation
        └── focal-points/route.ts # Convergence detection
```

**Total: ~15 route files** vs WorldMonitor's 60+ endpoint files.

---

## 6. Data Layer — RLM (Recursive Learning Model)

### Why RLM over RAG

WorldMonitor uses a basic RAG setup:
- Client-side ONNX embeddings (`all-MiniLM-L6-v2`, 384-dim)
- IndexedDB vector store (5,000 vectors, brute-force cosine similarity)
- One-shot retrieval — no feedback, no learning

**RLM improves on this with recursive retrieval + feedback loops:**

```
┌──────────────────────────────────────────────────┐
│                 RLM Pipeline                      │
│                                                   │
│  Step 1: INGEST                                   │
│  ┌─────────┐    ┌──────────┐    ┌─────────────┐  │
│  │ RSS     │───▶│ Chunk &  │───▶│ Embed       │  │
│  │ Items   │    │ Classify │    │ (server)    │  │
│  └─────────┘    └──────────┘    └──────┬──────┘  │
│                                        │          │
│  Step 2: STORE                         ▼          │
│  ┌─────────────────────────────────────────────┐  │
│  │           Upstash Vector DB                  │  │
│  │  (embeddings + metadata + decay scores)      │  │
│  └─────────────────────────┬───────────────────┘  │
│                             │                     │
│  Step 3: RECURSIVE RETRIEVE │                     │
│  ┌──────────┐    ┌─────────┴──┐    ┌──────────┐  │
│  │ Query    │───▶│ Retrieve   │───▶│ Evaluate │  │
│  │          │    │ Top-K      │    │ Relevance│  │
│  └──────────┘    └────────────┘    └────┬─────┘  │
│                                         │         │
│                    ┌────────────────────┘         │
│                    │ If insufficient:              │
│                    ▼ RECURSE with refined query    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Reformulate query using retrieved context   │ │
│  │  + original query → re-retrieve (max 3x)    │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Step 4: SYNTHESIZE                               │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐ │
│  │ Ranked   │───▶│ LLM      │───▶│ Response +  │ │
│  │ Context  │    │ Generate │    │ Citations   │ │
│  └──────────┘    └──────────┘    └─────────────┘ │
│                                                   │
│  Step 5: LEARN (feedback loop)                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ Track which retrieved items were actually     │ │
│  │ used in the final response. Boost their       │ │
│  │ relevance scores. Decay unused items.         │ │
│  │ Update entity co-occurrence graph.            │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### RLM Implementation

```typescript
interface RLMConfig {
  maxRecursionDepth: 3;
  minRelevanceThreshold: 0.7;
  decayFactor: 0.95;         // daily decay for unused items
  boostFactor: 1.2;          // boost for items used in responses
  embeddingModel: 'text-embedding-3-small'; // OpenAI-compatible
  vectorDimensions: 1536;
  topK: 15;
}

interface VectorEntry {
  id: string;
  embedding: number[];
  metadata: {
    title: string;
    source: string;
    timestamp: number;
    entities: string[];
    threatLevel: string;
    relevanceScore: number;  // decays over time, boosted on use
    useCount: number;
    lastUsed: number;
  };
}

interface RetrievalResult {
  entries: VectorEntry[];
  recursionDepth: number;
  reformulatedQueries: string[];
  relevanceScores: number[];
}
```

### Key Differences from WorldMonitor's RAG

| Feature | WorldMonitor RAG | WorldView RLM |
|---|---|---|
| Embedding location | Browser (ONNX Web Worker) | Server-side (Groq or dedicated embedding API) |
| Vector storage | IndexedDB (5K cap, client-only) | Upstash Vector (persistent, shared across users) |
| Similarity search | Brute-force cosine (O(n)) | Approximate nearest neighbor (HNSW) |
| Retrieval strategy | One-shot top-K | Recursive retrieval with query reformulation |
| Learning | None | Relevance decay + usage boost feedback loop |
| Entity linking | Separate entity-index.ts | Co-occurrence graph embedded in vector metadata |
| Capacity | 5,000 vectors per browser | Millions of vectors, shared |

---

## 7. Frontend Architecture

### Component Hierarchy

```
app/
├── layout.tsx                    # Root layout (dark theme, fonts)
├── page.tsx                      # Dashboard home
├── globals.css                   # Tailwind v4 + CSS custom properties
│
├── (dashboard)/                  # Dashboard route group
│   ├── layout.tsx                # Dashboard shell (sidebar + header)
│   ├── page.tsx                  # Main dashboard view
│   ├── country/[code]/page.tsx   # Country brief page (SSR)
│   └── analysis/page.tsx         # AI analysis page
│
├── components/
│   ├── ui/                       # Primitives (Button, Card, Badge, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Header.tsx            # Top bar (search, theme toggle)
│   │   └── DashboardGrid.tsx     # Responsive panel grid
│   ├── panels/
│   │   ├── NewsPanel.tsx         # RSS news feed (Server Component)
│   │   ├── ConflictPanel.tsx     # Conflict events
│   │   ├── MarketPanel.tsx       # Market overview
│   │   ├── CIIPanel.tsx          # Country Instability Index
│   │   ├── SignalsPanel.tsx      # Signal aggregation
│   │   ├── FocalPointsPanel.tsx  # Convergence detection
│   │   ├── MilitaryPanel.tsx     # Military tracking
│   │   └── AISummaryPanel.tsx    # AI-generated brief
│   ├── map/
│   │   ├── Globe.tsx             # deck.gl globe (Client Component)
│   │   ├── MapControls.tsx       # Layer toggles
│   │   └── MapPopup.tsx          # Feature popups
│   ├── intelligence/
│   │   ├── CountryBrief.tsx      # Full country dossier
│   │   ├── ThreatBadge.tsx       # Threat level indicator
│   │   └── TimelineChart.tsx     # Event timeline (d3)
│   └── ai/
│       ├── WorldBrief.tsx        # AI-synthesized global summary
│       ├── DeductionPanel.tsx    # Interactive analysis
│       └── ChatInterface.tsx     # Natural language queries
│
├── lib/
│   ├── api/                      # API client functions
│   ├── stores/                   # Zustand stores
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Pure utility functions
│   └── types/                    # Shared TypeScript types
│
└── api/                          # API Route Handlers
```

### Server vs Client Component Split

| Server Components (default) | Client Components (explicit) |
|---|---|
| NewsPanel (fetches RSS server-side) | Globe (WebGL, deck.gl) |
| ConflictPanel (fetches ACLED/UCDP) | MapControls (interactive toggles) |
| CIIPanel (computes scores) | MarketPanel (real-time updates) |
| CountryBrief (SSR country page) | ChatInterface (user input) |
| AISummaryPanel (LLM call) | ThemeToggle |
| Layout, Sidebar, Header | CommandPalette (Cmd+K) |

---

## 8. UI/UX Design Principles

### Design Philosophy

1. **Progressive disclosure** — Show summary first, details on demand. No information overload.
2. **Spatial hierarchy** — Globe is the primary anchor. Panels orbit around it contextually.
3. **Calm by default** — Dark theme, muted colors. Only alerts use high-contrast colors.
4. **Consistent visual language** — Threat levels map to exactly 5 colors everywhere:
   - `critical` → red-500
   - `high` → orange-500
   - `medium` → amber-500
   - `low` → blue-500
   - `info` → slate-400
5. **Mobile-aware but desktop-first** — Responsive layout that degrades gracefully.
6. **Keyboard-first navigation** — Cmd+K palette, arrow key navigation, hotkeys for views.

### Layout Concept

```
┌─────────────────────────────────────────────────┐
│  Header: Search │ Theme │ Alerts │ Settings      │
├────┬────────────────────────────────────────────┤
│    │                                             │
│ S  │          Globe / Map                        │
│ i  │          (primary, 60% width)               │
│ d  │                                             │
│ e  ├─────────────────┬───────────────────────────┤
│ b  │  AI Brief       │  Focal Points             │
│ a  │  (summary card) │  (convergence alerts)     │
│ r  ├─────────────────┼───────────────────────────┤
│    │  News Feed      │  CII Scores               │
│    │  (clustered)    │  (country risk table)      │
│    ├─────────────────┼───────────────────────────┤
│    │  Conflicts      │  Markets                   │
│    │  (ACLED + UCDP) │  (stocks + crypto)        │
└────┴─────────────────┴───────────────────────────┘
```

### Key UI Components (Tailwind v4)

- **Card** — `rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm`
- **Badge** — severity-colored pills with subtle glow
- **Sparkline** — inline SVG, 48x16px, color-coded trend
- **Score Ring** — animated SVG arc (0-100) for CII
- **Data Table** — virtualized rows, sortable headers
- **Command Palette** — Cmd+K with fuzzy search across all entities

---

## 9. State Management

### Zustand Stores (modular, not monolithic)

```typescript
// lib/stores/news.ts
interface NewsStore {
  items: NewsItem[];
  clusters: ClusteredEvent[];
  isLoading: boolean;
  lastUpdated: Date | null;
  fetchNews: () => Promise<void>;
  setTimeRange: (range: TimeRange) => void;
}

// lib/stores/signals.ts
interface SignalStore {
  signals: GeoSignal[];
  summary: SignalSummary | null;
  convergenceZones: RegionalConvergence[];
  topCountries: CountrySignalCluster[];
  ingestSignals: (type: SignalType, data: unknown[]) => void;
}

// lib/stores/map.ts
interface MapStore {
  layers: MapLayers;
  view: MapView;
  zoom: number;
  center: { lat: number; lon: number };
  toggleLayer: (key: keyof MapLayers) => void;
  setView: (view: MapView) => void;
}

// lib/stores/intelligence.ts
interface IntelligenceStore {
  ciiScores: CountryScore[];
  focalPoints: FocalPoint[];
  hotspots: Hotspot[];
  isLearning: boolean;
}
```

### Why Zustand over Redux/Context

- **Tiny** — 1KB, no boilerplate
- **No providers** — access from anywhere (including outside React)
- **Selective subscriptions** — components only re-render on the slice they use
- **Middleware** — persist to localStorage, devtools, immer for immutable updates
- **Works with Server Components** — stores are client-side only, hydrated on mount

---

## 10. Caching Strategy

### Two-Tier Only

```
┌─────────────────────────────────────┐
│  Tier 1: Next.js fetch() cache      │
│  ─────────────────────────────      │
│  • Automatic deduplication          │
│  • revalidate: N seconds            │
│  • Tags for targeted invalidation   │
│  • ISR for semi-static pages        │
└──────────────┬──────────────────────┘
               │ (cache MISS)
┌──────────────┴──────────────────────┐
│  Tier 2: Upstash Redis              │
│  ─────────────────────────────      │
│  • Cross-request deduplication      │
│  • Shared across all users          │
│  • TTL-based expiry                 │
│  • Used for expensive API calls     │
│  • Also used for Upstash Vector     │
└──────────────┬──────────────────────┘
               │ (Redis MISS)
┌──────────────┴──────────────────────┐
│  Origin: External API               │
└─────────────────────────────────────┘
```

### Cache TTLs

| Data Type | Next.js revalidate | Redis TTL | Rationale |
|---|---|---|---|
| RSS feeds | 5 min | 10 min | News needs freshness |
| ACLED conflicts | 1 hour | 6 hours | Updates infrequently |
| UCDP events | 6 hours | 24 hours | Academic, slow updates |
| GDELT | 5 min | 10 min | Near real-time |
| Stock quotes | 1 min | 2 min | Market hours sensitivity |
| Crypto prices | 2 min | 3 min | 24/7 market |
| FRED economic | 1 hour | 6 hours | Fed schedule updates |
| Earthquakes | 5 min | 10 min | USGS updates every 5 min |
| NASA FIRMS fires | 10 min | 30 min | Satellite passes |
| OpenSky flights | 30 sec | 1 min | Near real-time |
| LLM summaries | 1 hour | 4 hours | Content-addressed |
| CII scores | 10 min | 30 min | Composite, needs freshness |

---

## 11. AI/ML Pipeline

### Simplified Architecture

WorldMonitor has a complex 4-tier LLM fallback chain with browser-side ONNX inference. WorldView simplifies to:

```
┌────────────────┐
│ AI Request     │
│ (summarize,    │
│  classify,     │
│  analyze)      │
└───────┬────────┘
        │
        ▼
┌────────────────┐    timeout/error    ┌────────────────┐
│ Tier 1: Groq   │──────────────────▶  │ Tier 2:        │
│ (fast, free)   │                     │ OpenRouter     │
│ llama-3.3-70b  │                     │ (fallback)     │
└────────────────┘                     └────────────────┘
```

No browser-side ML. All inference happens server-side. This eliminates:
- ONNX Runtime Web dependency
- Web Worker management
- ML capability detection
- Model download/caching in browser
- Memory budget management

### AI Features

1. **World Brief** — Daily synthesis of top global developments (Server Component, cached 1 hour)
2. **Threat Classification** — Hybrid keyword + LLM classification for news events
3. **Country Analysis** — On-demand country intelligence briefs with citations
4. **Deduction Engine** — User asks questions, LLM answers with live headline context
5. **Entity-aware search** — Natural language queries resolved against the entity index + RLM vector store

### LLM Prompt Templates

Store prompts as typed constants:

```typescript
// lib/ai/prompts.ts
export const PROMPTS = {
  worldBrief: (headlines: string[]) => `...`,
  countryAnalysis: (country: string, context: string) => `...`,
  threatClassify: (title: string, description?: string) => `...`,
  deduction: (query: string, newsContext: string) => `...`,
} as const;
```

---

## 12. Map & Visualization

### Tech Stack

- **deck.gl** — WebGL globe with data layers (keep from WorldMonitor)
- **MapLibre GL JS** — 2D base map tiles
- **react-map-gl** — React bindings for MapLibre
- **d3** — Timeline charts, score visualizations

### Layer Reduction

WorldMonitor has 35+ layers. WorldView starts with **12 essential layers**:

| Layer | Data Source | Priority |
|---|---|---|
| `conflicts` | ACLED + UCDP | Core |
| `hotspots` | Static config + dynamic | Core |
| `bases` | Static config | Core |
| `protests` | ACLED | Core |
| `flights` | OpenSky | Core |
| `earthquakes` | USGS | Core |
| `fires` | NASA FIRMS | Core |
| `outages` | Future (IODA) | Phase 2 |
| `nuclear` | Static config | Phase 2 |
| `cables` | Static config | Phase 2 |
| `pipelines` | Static config | Phase 2 |
| `cyberThreats` | Future | Phase 3 |

### Static Data to Copy from WorldMonitor

These are hardcoded datasets in worldmonitor that should be copied:

```
src/config/geo.ts           → Military bases, conflict zones, hotspots
src/config/cables.ts        → Undersea cable routes + landing points
src/config/pipelines.ts     → Oil/gas pipeline routes
src/config/nuclear.ts       → Nuclear facility locations
src/config/entities.ts      → 600+ entity registry (companies, countries, indices)
src/config/country-aliases  → Country name → alias mapping for entity extraction
```

---

## 13. What to Copy from WorldMonitor

### Files to Copy Directly (adapt to TypeScript/React)

| WorldMonitor File | WorldView Destination | Notes |
|---|---|---|
| `src/types/index.ts` (1,297 lines) | `lib/types/` (split into modules) | Core data model types |
| `src/config/geo.ts` | `lib/data/geo.ts` | Hotspots, bases, conflict zones |
| `src/config/cables.ts` | `lib/data/cables.ts` | Undersea cables |
| `src/config/pipelines.ts` | `lib/data/pipelines.ts` | Pipelines |
| `src/config/nuclear.ts` | `lib/data/nuclear.ts` | Nuclear facilities |
| `src/config/entities.ts` | `lib/data/entities.ts` | Entity registry |
| `src/services/clustering.ts` | `lib/services/clustering.ts` | News clustering logic |
| `src/services/threat-classifier.ts` | `lib/services/threat-classifier.ts` | Keyword classification |
| `src/services/entity-extraction.ts` | `lib/services/entity-extraction.ts` | Entity linking |
| `src/services/entity-index.ts` | `lib/services/entity-index.ts` | Multi-index entity lookup |
| `src/services/signal-aggregator.ts` | `lib/services/signal-aggregator.ts` | Signal fusion |
| `src/services/country-instability.ts` | `lib/services/country-instability.ts` | CII scoring |
| `src/services/hotspot-escalation.ts` | `lib/services/hotspot-escalation.ts` | Escalation scoring |
| `src/services/focal-point-detection.ts` | `lib/services/focal-point-detection.ts` | Convergence detection |
| `src/utils/circuit-breaker.ts` | `lib/utils/circuit-breaker.ts` | API resilience |
| `api/_cors.js` | `lib/middleware/cors.ts` | CORS logic (adapt) |
| `api/_upstash-cache.js` | `lib/cache/redis.ts` | Redis wrapper (simplify) |
| `api/_ip-rate-limit.js` | `lib/middleware/rate-limit.ts` | Rate limiting |
| RSS feed configs | `lib/data/feeds.ts` | Curated subset (~40 feeds) |

### Files NOT to Copy

- Anything in `src-tauri/` (desktop app)
- `src/workers/` (Web Workers)
- `src/services/ml-*.ts` (browser ML)
- `src/config/variants/` (multi-variant system)
- `src/locales/` (i18n translations — add later)
- `src/services/persistent-cache.ts` (Tauri + localStorage cache)
- `src/services/runtime.ts` (Tauri runtime detection)
- `src/services/runtime-config.ts` (desktop secrets/toggles)
- `src/services/tauri-bridge.ts` (Tauri IPC)
- `src/services/storage.ts` (IndexedDB — use Redis instead)
- `proto/` (protobuf definitions)
- `convex/` (Convex backend)
- `server/` (sebuf RPC handlers)

---

## 14. Project Structure

```
worldview/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── country/[code]/page.tsx
│   └── api/
│       ├── news/feeds/route.ts
│       ├── news/classify/route.ts
│       ├── conflicts/acled/route.ts
│       ├── conflicts/ucdp/route.ts
│       ├── conflicts/summary/route.ts
│       ├── geo/gdelt/route.ts
│       ├── geo/earthquakes/route.ts
│       ├── markets/stocks/route.ts
│       ├── markets/crypto/route.ts
│       ├── markets/macro/route.ts
│       ├── military/flights/route.ts
│       ├── military/fires/route.ts
│       ├── ai/summarize/route.ts
│       ├── ai/analyze/route.ts
│       ├── ai/classify/route.ts
│       └── intelligence/
│           ├── cii/route.ts
│           ├── signals/route.ts
│           └── focal-points/route.ts
├── lib/
│   ├── types/
│   │   ├── news.ts
│   │   ├── conflicts.ts
│   │   ├── military.ts
│   │   ├── signals.ts
│   │   ├── intelligence.ts
│   │   ├── markets.ts
│   │   ├── map.ts
│   │   └── index.ts
│   ├── data/
│   │   ├── geo.ts              # ← from worldmonitor
│   │   ├── cables.ts           # ← from worldmonitor
│   │   ├── pipelines.ts        # ← from worldmonitor
│   │   ├── nuclear.ts          # ← from worldmonitor
│   │   ├── entities.ts         # ← from worldmonitor
│   │   └── feeds.ts            # curated ~40 RSS feeds
│   ├── services/
│   │   ├── clustering.ts       # ← from worldmonitor
│   │   ├── threat-classifier.ts
│   │   ├── entity-extraction.ts
│   │   ├── entity-index.ts
│   │   ├── signal-aggregator.ts
│   │   ├── country-instability.ts
│   │   ├── hotspot-escalation.ts
│   │   └── focal-point-detection.ts
│   ├── ai/
│   │   ├── prompts.ts          # LLM prompt templates
│   │   ├── groq.ts             # Groq client wrapper
│   │   ├── openrouter.ts       # OpenRouter fallback
│   │   └── rlm.ts              # Recursive Learning Model
│   ├── cache/
│   │   └── redis.ts            # Upstash Redis wrapper
│   ├── stores/
│   │   ├── news.ts             # Zustand news store
│   │   ├── signals.ts          # Zustand signals store
│   │   ├── map.ts              # Zustand map store
│   │   └── intelligence.ts     # Zustand intel store
│   ├── hooks/
│   │   ├── use-news.ts
│   │   ├── use-signals.ts
│   │   ├── use-cii.ts
│   │   └── use-map-layers.ts
│   ├── utils/
│   │   ├── circuit-breaker.ts
│   │   ├── hash.ts
│   │   └── format.ts
│   └── middleware/
│       ├── cors.ts
│       └── rate-limit.ts
├── components/
│   ├── ui/                     # Design system primitives
│   ├── layout/
│   ├── panels/
│   ├── map/
│   ├── intelligence/
│   └── ai/
├── public/
│   ├── countries.geojson       # ← from worldmonitor
│   └── ...
├── .env.local
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts (if needed for v4)
└── tsconfig.json
```

---

## 15. Phase Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up Next.js 16 project structure
- [ ] Copy and adapt type definitions from WorldMonitor
- [ ] Copy static data files (geo, entities, feeds)
- [ ] Implement Upstash Redis cache wrapper
- [ ] Build RSS feed aggregation API route (server-side)
- [ ] Build news clustering pipeline (Jaccard)
- [ ] Implement Groq LLM integration (summarization + classification)
- [ ] Build basic dashboard layout (sidebar + grid + header)
- [ ] Create NewsPanel, ConflictPanel, AISummaryPanel
- [ ] Basic dark theme with Tailwind v4

### Phase 2: Intelligence Layer (Weeks 3-4)
- [ ] Port signal aggregator from WorldMonitor
- [ ] Port CII scoring from WorldMonitor
- [ ] Port focal point detection
- [ ] Port entity extraction + entity index
- [ ] Build CII Panel, Signals Panel, Focal Points Panel
- [ ] Implement ACLED + UCDP conflict API routes
- [ ] Build Country Brief page (SSR)
- [ ] Add Cmd+K command palette

### Phase 3: Map & Visualization (Weeks 5-6)
- [ ] Integrate deck.gl globe (Client Component)
- [ ] Implement 12 core map layers
- [ ] Map popups and interactions
- [ ] Layer toggle controls
- [ ] Copy country geometry (GeoJSON) for local detection
- [ ] Timeline chart (d3) for country briefs

### Phase 4: RLM & Advanced AI (Weeks 7-8)
- [ ] Set up Upstash Vector for embeddings
- [ ] Implement server-side embedding pipeline
- [ ] Build recursive retrieval logic
- [ ] Add relevance decay + usage boost feedback
- [ ] Natural language query interface
- [ ] Deduction engine (ask questions, get contextual answers)

### Phase 5: Markets & Polish (Weeks 9-10)
- [ ] Finnhub stock quotes integration
- [ ] CoinGecko crypto integration
- [ ] FRED economic indicators
- [ ] Market Panel with sparklines
- [ ] OpenSky military flight tracking
- [ ] NASA FIRMS fire data
- [ ] Performance optimization (React Suspense, streaming)
- [ ] Mobile responsive layout

### Phase 6: Production (Weeks 11-12)
- [ ] Error handling + circuit breakers
- [ ] Rate limiting on API routes
- [ ] Monitoring + logging (Sentry)
- [ ] Deploy to Vercel
- [ ] Documentation

---

## 16. Environment Variables

### Minimum Viable (.env.local)

```env
# ── AI (required) ────────────────────
GROQ_API_KEY=                    # Groq LLM — primary AI provider

# ── Cache (required) ─────────────────
UPSTASH_REDIS_REST_URL=          # Upstash Redis
UPSTASH_REDIS_REST_TOKEN=        # Upstash Redis token
```

### Recommended

```env
# ── AI ───────────────────────────────
GROQ_API_KEY=
OPENROUTER_API_KEY=              # Fallback LLM

# ── Cache ────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── Vector DB (for RLM) ─────────────
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=

# ── Data Sources ─────────────────────
ACLED_ACCESS_TOKEN=              # ACLED conflict data
ACLED_EMAIL=                     # ACLED email
FINNHUB_API_KEY=                 # Stock market data
FRED_API_KEY=                    # Economic indicators
NASA_FIRMS_API_KEY=              # Satellite fire data
```

**That's it.** 5 API keys for full functionality vs WorldMonitor's 15+.

---

## 17. Tech Stack Summary

| Layer | WorldMonitor | WorldView |
|---|---|---|
| **Framework** | Vanilla TypeScript (no framework) | Next.js 16 + React 19 |
| **Build** | Vite 6 | Next.js (Turbopack) |
| **Styling** | Raw CSS + CSS variables | Tailwind CSS v4 |
| **State** | Class properties + localStorage | Zustand |
| **Data Fetching** | Manual fetch() + circuit breakers | React Server Components + SWR |
| **API** | 60+ Vercel Edge Functions (plain JS) | ~15 Next.js Route Handlers (TypeScript) |
| **AI/ML** | Browser ONNX + Groq + OpenRouter | Server-side Groq + OpenRouter only |
| **RAG** | Client-side IndexedDB vectors | Server-side RLM with Upstash Vector |
| **Maps** | MapLibre + deck.gl (vanilla) | MapLibre + deck.gl (React bindings) |
| **Cache** | 5-tier (Redis + CDN + SW + IDB + localStorage) | 2-tier (Next.js cache + Redis) |
| **Desktop** | Tauri 2 (Rust) + Node.js sidecar | None (web-first, PWA later) |
| **i18n** | i18next (16 languages) | None initially (add later) |
| **Testing** | Playwright E2E | Playwright + Vitest |
| **External APIs** | 38 | 12-15 |
| **RSS Feeds** | 150+ | ~40 curated |
| **Deploy** | Vercel | Vercel |

---

## Key Principles

1. **Less is more** — 12 APIs that work perfectly beats 38 that break randomly
2. **Server-first** — All heavy lifting on the server; client is thin and fast
3. **Type-safe end-to-end** — Shared types, no protobuf ceremony needed
4. **Progressive enhancement** — Core works without JS; interactivity enhances
5. **Copy algorithms, not architecture** — WorldMonitor's intelligence logic is good; its application architecture isn't
6. **RLM > RAG** — Recursive retrieval with learning beats one-shot retrieval
7. **Ship fast, iterate** — Phase 1 should be deployable in 2 weeks
