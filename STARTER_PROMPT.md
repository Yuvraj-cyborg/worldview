# WorldView — Starter Prompt

> Copy everything below the line into a new chat session.

---

## The Prompt

You are building **WorldView** — a next-generation real-time global intelligence dashboard. The project already exists at the current workspace root as a fresh Next.js 16 + React 19 + Tailwind CSS v4 app (created with `create-next-app`). Read `WORLDVIEW_APPROACH.md` in the project root for the full architecture document covering API strategy, data models, what to copy from the predecessor repo (`../worldmonitor`), caching, RLM, and phase roadmap.

Your job is to build Phase 1 of WorldView from scratch. Below is everything you need.

---

### PROJECT CONTEXT

WorldView is the successor to WorldMonitor (`../worldmonitor`), an open-source global intelligence dashboard with 38 APIs, 60+ endpoints, a 4,300-line monolithic App class, and vanilla TypeScript with no framework. WorldView rebuilds this with modern architecture, fewer APIs (12 vs 38), cleaner UI, and better data intelligence (RLM instead of basic RAG).

The predecessor repo at `../worldmonitor` contains algorithms, data models, type definitions, and static datasets that should be ported. See `WORLDVIEW_APPROACH.md` §13 "What to Copy from WorldMonitor" for the exact file mapping.

---

### TECH STACK (already installed unless noted)

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16 (App Router) | Installed |
| UI | React 19 | Installed |
| Styling | Tailwind CSS v4 | Installed |
| Components | shadcn/ui (latest, Tailwind v4 compatible) | **Install** |
| Animation | Framer Motion 12+ | **Install** |
| State | Zustand | **Install** |
| Data Fetching | SWR or TanStack Query | **Install** |
| Charts | Recharts (shadcn-compatible) | **Install** |
| Maps | deck.gl + MapLibre GL + react-map-gl | **Install in Phase 3** |
| Icons | Lucide React | **Install** |
| Dark Mode | next-themes | **Install** |
| Cache | Upstash Redis (@upstash/redis) | **Install** |
| AI | Groq SDK (groq-sdk) | **Install** |
| RSS Parsing | fast-xml-parser | **Install** |
| Package Manager | bun | Already configured |

---

### DESIGN SYSTEM — STATE OF THE ART (2026)

This is the most important section. The UI must be **beautiful enough to be a portfolio piece**. Follow these principles religiously:

#### Visual Identity

**Theme: "Liquid Glass Dark"** — A refined dark interface inspired by the 2026 Liquid Glass design trend. Not the garish glassmorphism of 2021. This is restrained, purposeful, atmospheric.

**Color System (OKLCH for Tailwind v4):**

```css
/* globals.css — Design Tokens */
@theme inline {
  /* Base palette — zinc-anchored dark */
  --color-surface-0: oklch(0.10 0.005 260);     /* deepest background */
  --color-surface-1: oklch(0.13 0.005 260);     /* card background */
  --color-surface-2: oklch(0.16 0.008 260);     /* elevated card / hover */
  --color-surface-3: oklch(0.20 0.010 260);     /* active / pressed */

  /* Borders — extremely subtle */
  --color-border: oklch(0.25 0.005 260 / 0.5);
  --color-border-hover: oklch(0.35 0.008 260 / 0.6);

  /* Text hierarchy */
  --color-text-primary: oklch(0.95 0.005 260);   /* headings, primary */
  --color-text-secondary: oklch(0.65 0.005 260);  /* descriptions */
  --color-text-muted: oklch(0.45 0.005 260);      /* timestamps, labels */

  /* Accent — cold teal-cyan (intelligence/OSINT feel) */
  --color-accent: oklch(0.72 0.15 195);
  --color-accent-hover: oklch(0.78 0.15 195);
  --color-accent-muted: oklch(0.72 0.15 195 / 0.15);

  /* Semantic — Threat levels (THE canonical 5-color system) */
  --color-critical: oklch(0.65 0.25 25);         /* red — critical */
  --color-high: oklch(0.72 0.18 55);             /* orange — high */
  --color-medium: oklch(0.80 0.15 85);           /* amber — medium */
  --color-low: oklch(0.70 0.12 240);             /* blue — low */
  --color-info: oklch(0.55 0.02 260);            /* slate — info */

  /* Positive */
  --color-positive: oklch(0.72 0.18 155);        /* green — up/good */
  --color-negative: oklch(0.65 0.22 25);         /* red — down/bad */
}
```

**Typography:**
- Font: `Inter` (variable weight) for UI, `JetBrains Mono` for data/numbers
- Headings: 600 weight, tight tracking (-0.025em)
- Body: 400 weight, relaxed leading (1.6)
- Data values: mono font, tabular-nums, 500 weight
- Sizes: Follow a modular scale — 11px (labels), 13px (body small), 14px (body), 16px (subtitle), 20px (title), 28px (hero)

**Spacing:**
- 4px base unit. Everything snaps to 4/8/12/16/20/24/32/40/48 grid.
- Panel padding: 16px (compact) or 20px (comfortable)
- Panel gap: 12px (dense grid) or 16px (standard)
- Section gap: 24px

#### Glass Card Component Pattern

Every panel/card uses this exact pattern:

```tsx
// The canonical WorldView card
<div className="
  relative overflow-hidden rounded-2xl
  bg-surface-1/80 backdrop-blur-xl
  border border-white/[0.06]
  shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_-2px_rgba(0,0,0,0.3)]
  transition-all duration-200
  hover:bg-surface-2/80 hover:border-white/[0.1]
  hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.4)]
">
  {/* Panel header */}
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
    <div className="flex items-center gap-2.5">
      <div className="size-1.5 rounded-full bg-accent animate-pulse" />
      <h3 className="text-[13px] font-semibold tracking-wide uppercase text-text-secondary">
        Panel Title
      </h3>
    </div>
    <span className="text-[11px] font-mono text-text-muted tabular-nums">
      2m ago
    </span>
  </div>

  {/* Panel content */}
  <div className="p-5">
    {children}
  </div>
</div>
```

#### Animation Principles (Framer Motion)

Follow 2026 motion best practices:

- **Micro-interactions**: 100-200ms, `ease-out`
- **Transitions**: 200-300ms, spring `{ stiffness: 360, damping: 36 }`
- **Page/panel enters**: `AnimatePresence` + staggered children (50ms delay between items)
- **Data updates**: Numbers count up with `motion.span` and `useMotionValue`
- **Only animate `transform` and `opacity`** — never layout properties
- **Respect `prefers-reduced-motion`**: wrap all animations in a custom `useReducedMotion()` check
- **Loading states**: Skeleton shimmer with subtle gradient animation, NOT spinners
- **Threat badge glow**: `box-shadow` pulse animation at 2s interval for critical items only

Spring configs to use globally:

```typescript
export const springs = {
  fast: { type: "spring", stiffness: 420, damping: 32 },
  base: { type: "spring", stiffness: 360, damping: 36 },
  slow: { type: "spring", stiffness: 200, damping: 28 },
  snappy: { type: "spring", stiffness: 520, damping: 28 },
} as const;
```

#### Layout Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER BAR  (h-14, sticky top-0, glass bg, z-50)              │
│  [Logo] [WorldView]     [Search ⌘K]    [Alerts 🔴3] [⚙] [🌙] │
├──────┬──────────────────────────────────────────────────────────┤
│      │                                                          │
│  S   │  MAIN CONTENT AREA                                       │
│  I   │                                                          │
│  D   │  ┌─────────────────────────────────────────────────┐     │
│  E   │  │  AI BRIEF — World Summary (full width)          │     │
│  B   │  │  "Here's what matters right now..."             │     │
│  A   │  └─────────────────────────────────────────────────┘     │
│  R   │                                                          │
│      │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  w   │  │ TOP SIGNALS  │  │ CII SCORES   │  │ FOCAL POINTS │   │
│  -   │  │ (convergence │  │ (risk table) │  │ (entities    │   │
│  5   │  │  alerts)     │  │              │  │  converging) │   │
│  6   │  └──────────────┘  └──────────────┘  └──────────────┘   │
│      │                                                          │
│  i   │  ┌──────────────────────┐  ┌────────────────────────┐   │
│  c   │  │  NEWS FEED           │  │  CONFLICTS             │   │
│  o   │  │  (clustered, scored, │  │  (ACLED + UCDP map)    │   │
│  n   │  │   threat-colored)    │  │                        │   │
│  s   │  └──────────────────────┘  └────────────────────────┘   │
│      │                                                          │
│  +   │  ┌──────────────────────┐  ┌────────────────────────┐   │
│      │  │  MARKETS             │  │  MILITARY / FIRES      │   │
│  l   │  │  (stocks + crypto    │  │  (OpenSky + FIRMS)     │   │
│  a   │  │   sparklines)        │  │                        │   │
│  b   │  └──────────────────────┘  └────────────────────────┘   │
│  e   │                                                          │
│  l   │                                                          │
│  s   │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

**Sidebar:**
- Width: 56px collapsed (icons only), 240px expanded
- Glass background with border-right
- Icon + label for each section
- Active item has accent left-border + accent-muted background
- Collapse/expand with smooth width animation
- Bottom: user avatar, settings gear

**Header:**
- Height: 56px, sticky, glass background `bg-surface-0/70 backdrop-blur-xl`
- Left: Logo mark + "WorldView" wordmark
- Center: Search bar (Cmd+K trigger) with glass pill shape
- Right: Alert bell with count badge, settings, theme toggle

**Grid:**
- CSS Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- AI Brief spans full width
- Cards auto-height with `min-h-[280px]`
- 12px gap

#### Component Design Specs

**Threat Badge:**
```
┌──────────────┐
│ 🔴 CRITICAL  │  — bg-critical/15, text-critical, border-critical/20
├──────────────┤
│ 🟠 HIGH      │  — bg-high/15, text-high, border-high/20
├──────────────┤
│ 🟡 MEDIUM    │  — bg-medium/15, text-medium, border-medium/20
├──────────────┤
│ 🔵 LOW       │  — bg-low/15, text-low, border-low/20
├──────────────┤
│ ⚪ INFO      │  — bg-info/15, text-info, border-info/20
└──────────────┘
Pill shape, 11px font, font-semibold, px-2 py-0.5, rounded-full
```

**Sparkline:**
- Inline SVG, 64x20px
- Stroke width: 1.5px
- Color: green if trend up, red if down
- Area fill with 10% opacity gradient
- No axes, no labels — pure data ink

**Score Ring (CII):**
- SVG circle, stroke-dasharray animated
- 0-100 range mapped to arc
- Color transitions: green (0-30) → amber (30-60) → orange (60-80) → red (80-100)
- Center: large number in mono font
- Label below: "Country Instability Index"

**News Item Row:**
```
┌────────────────────────────────────────────────────────────┐
│ [CRITICAL] Headline text here spanning full width...        │
│ Reuters · 3 sources · 12m ago · ▲ spike                    │
│                                                  ────────  │ ← sparkline
└────────────────────────────────────────────────────────────┘
- Threat badge left-aligned
- Source count as "3 sources" if clustered
- Velocity indicator (▲ spike / → stable / ▼ falling)
- Hover: bg-surface-2 transition, slight scale(1.005)
- Click: expand to show all sources + summary
```

**Data Table Row:**
```
┌────┬──────────────┬────────┬────────┬────────┬──────────┐
│ 🇺🇦│ Ukraine      │   87   │ ▲ +4.2 │ HIGH   │ ████░░░░ │
│ 🇮🇱│ Israel       │   82   │ → -0.1 │ HIGH   │ ███░░░░░ │
│ 🇸🇩│ Sudan        │   76   │ ▲ +2.8 │ HIGH   │ ███░░░░░ │
└────┴──────────────┴────────┴────────┴────────┴──────────┘
- Flag emoji + country name
- CII score in mono font, right-aligned
- Trend arrow + delta, color-coded
- Threat level badge
- Mini bar chart (score visualized)
- Sortable columns, hover highlight
```

#### Interaction Design

1. **Hover states**: Every interactive element has a visible hover state. Cards lift slightly (`translateY(-1px)`) and border brightens.
2. **Focus states**: Visible focus ring (`ring-2 ring-accent/50 ring-offset-2 ring-offset-surface-0`) for keyboard users.
3. **Loading**: Skeleton screens with shimmer animation. Never blank white space. Never spinners.
4. **Empty states**: Illustrated empty state with helpful message. Never just "No data".
5. **Error states**: Red-tinted card with error icon, retry button. Never just a console error.
6. **Transitions**: Page transitions with `AnimatePresence` — fade + slide up (20px, 300ms).
7. **Data refresh**: Subtle pulse on the "live" indicator dot when data refreshes. Numbers morph (count up/down) rather than jump.
8. **Command Palette**: `Cmd+K` opens a full-screen glass modal with fuzzy search across all entities, countries, signals.

#### Responsive Strategy

| Breakpoint | Layout |
|---|---|
| `< 768px` | Single column, sidebar hidden, bottom nav |
| `768-1024px` | 2-column grid, sidebar collapsed (56px) |
| `1024-1440px` | 3-column grid, sidebar expanded (240px) |
| `> 1440px` | 3-column grid with wider panels, sidebar expanded |
| `> 1920px` | 4-column grid for ultra-wide monitors |

---

### PHASE 1 TASKS — BUILD THESE NOW

Build the following in order. Each step should produce a working, visually polished result before moving to the next.

#### Step 1: Foundation Setup
- [ ] Install dependencies: `bun add shadcn zustand framer-motion next-themes lucide-react swr @upstash/redis groq-sdk fast-xml-parser`
- [ ] Initialize shadcn/ui: `bunx shadcn@latest init` (dark theme, zinc base, OKLCH colors)
- [ ] Set up the design token system in `globals.css` (use the color tokens above)
- [ ] Configure `next-themes` with dark mode default (no flash)
- [ ] Set up Inter + JetBrains Mono fonts via `next/font`
- [ ] Create the root layout with proper metadata, viewport, theme

#### Step 2: Layout Shell
- [ ] Build the collapsible Sidebar component (icons + labels, 56px/240px, glass style)
- [ ] Build the Header component (logo, search trigger, alerts, theme toggle)
- [ ] Build the DashboardGrid component (responsive CSS grid)
- [ ] Build the GlassCard component (the canonical card pattern from above)
- [ ] Wire up the dashboard layout: `/app/(dashboard)/layout.tsx`
- [ ] Add page transition animations with `AnimatePresence`

#### Step 3: AI Brief Panel
- [ ] Create the Groq client wrapper (`lib/ai/groq.ts`)
- [ ] Build the AI Brief Server Component that fetches and displays a world summary
- [ ] Style it as a full-width hero card with gradient accent border
- [ ] Add skeleton loading state
- [ ] Cache the response with `revalidate: 3600` (1 hour)

#### Step 4: News Feed Panel
- [ ] Copy and adapt RSS feed config from WorldMonitor (curate to ~40 feeds)
- [ ] Build the server-side feed aggregation API route (`/api/news/feeds`)
- [ ] Port the Jaccard clustering algorithm from WorldMonitor
- [ ] Port the threat classifier (keyword-based) from WorldMonitor
- [ ] Build the NewsPanel component with clustered, threat-colored items
- [ ] Add velocity indicators (spike/stable/falling)
- [ ] Add expand-on-click for clustered items
- [ ] Cache feeds in Redis with 10-minute TTL

#### Step 5: CII Scores Panel
- [ ] Port the CountryScore types from WorldMonitor
- [ ] Build a simplified CII computation (news volume + conflict data + signal density)
- [ ] Build the CII table component with flag, score, trend, bar chart
- [ ] Add sorting (by score, by trend, by name)
- [ ] Score ring component for individual country view
- [ ] Animate score changes with Framer Motion

#### Step 6: Signals Panel
- [ ] Port the signal aggregator types from WorldMonitor
- [ ] Build a simplified signal summary (news-based signals initially)
- [ ] Build the Signals panel showing convergence zones and top countries
- [ ] Threat-colored signal chips

#### Step 7: Markets Panel (if Finnhub key available)
- [ ] Build Finnhub API route for stock quotes
- [ ] Build CoinGecko API route for crypto
- [ ] Build the Markets panel with sparklines
- [ ] Green/red color coding for up/down
- [ ] Auto-refresh with SWR (2 minute interval)

#### Step 8: Command Palette
- [ ] Build Cmd+K modal with glass overlay
- [ ] Fuzzy search across countries, signals, news headlines
- [ ] Keyboard navigation (arrow keys, enter, escape)
- [ ] Recent searches in localStorage

---

### QUALITY BAR

Every component you build must meet this bar:

1. **Visually stunning** — Would look at home on a Vercel or Linear marketing page
2. **Accessible** — WCAG AA contrast ratios, keyboard navigable, screen reader labels
3. **Performant** — Server Components by default, Client Components only for interactivity
4. **Type-safe** — Full TypeScript, no `any`, no type assertions unless truly necessary
5. **Responsive** — Works on 768px tablet through 2560px ultrawide
6. **Animated** — Smooth transitions, skeleton loading, number morphing. But purposeful — never gratuitous
7. **Error-resilient** — Every fetch has error boundaries, fallback UI, and retry capability
8. **Production-ready** — No TODO comments, no placeholder data in committed code, no console.logs

---

### FILE REFERENCES IN PREDECESSOR REPO

When you need data models, algorithms, or static data, reference these files in `../worldmonitor`:

| What | File Path |
|---|---|
| All TypeScript types (60+ interfaces) | `../worldmonitor/src/types/index.ts` |
| Entity registry (600+ entities) | `../worldmonitor/src/config/entities.ts` |
| Entity index (multi-map lookup) | `../worldmonitor/src/services/entity-index.ts` |
| News clustering (Jaccard) | `../worldmonitor/src/services/clustering.ts` |
| Threat classifier | `../worldmonitor/src/services/threat-classifier.ts` |
| Entity extraction | `../worldmonitor/src/services/entity-extraction.ts` |
| Signal aggregator | `../worldmonitor/src/services/signal-aggregator.ts` |
| CII scoring | `../worldmonitor/src/services/country-instability.ts` |
| Hotspot escalation | `../worldmonitor/src/services/hotspot-escalation.ts` |
| Focal point detection | `../worldmonitor/src/services/focal-point-detection.ts` |
| Geopolitical data (bases, hotspots, conflict zones) | `../worldmonitor/src/config/geo.ts` |
| Undersea cables | `../worldmonitor/src/config/cables.ts` |
| Pipelines | `../worldmonitor/src/config/pipelines.ts` |
| Nuclear facilities | `../worldmonitor/src/config/nuclear.ts` |
| RSS feed definitions | `../worldmonitor/src/config/feeds/` |
| Circuit breaker utility | `../worldmonitor/src/utils/circuit-breaker.ts` |
| Cache utility (Upstash) | `../worldmonitor/api/_upstash-cache.js` |
| Rate limiter | `../worldmonitor/api/_ip-rate-limit.js` |
| CORS middleware | `../worldmonitor/api/_cors.js` |
| Country geometry GeoJSON | `../worldmonitor/public/countries-110m.json` or similar |

When porting these files:
- Convert class-based patterns to functional React patterns
- Convert vanilla TS to proper React hooks/components where appropriate
- Keep the core algorithms intact — they work well
- Simplify where possible (remove Tauri/desktop-specific code paths)
- Add proper TypeScript types (remove any `any` types)

---

### ENVIRONMENT VARIABLES

Create `.env.local` with:

```env
GROQ_API_KEY=              # Required — get from https://console.groq.com
UPSTASH_REDIS_REST_URL=    # Required — get from https://upstash.com
UPSTASH_REDIS_REST_TOKEN=  # Required
FINNHUB_API_KEY=           # Optional — get from https://finnhub.io
ACLED_ACCESS_TOKEN=        # Optional — get from https://developer.acleddata.com
ACLED_EMAIL=               # Optional
```

---

### START BUILDING

Begin with Step 1 (Foundation Setup). After each step, make sure the app runs and looks polished before moving on. Prioritize visual quality — this should look like a product from the future, not a hackathon project.

When in doubt about a design decision, choose the option that is:
1. More minimal
2. More spacious
3. More calm
4. More consistent

The UI should feel like sitting in a quiet, dimly-lit intelligence operations center — focused, atmospheric, precise. Not a Bloomberg terminal. Not a cluttered news aggregator. Think: **Palantir meets Linear meets the Vercel dashboard, rendered in liquid glass.**
