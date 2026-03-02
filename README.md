# GeoTrack

**Real-time global intelligence dashboard** — monitor geopolitical conflicts, financial markets, threat signals, and world events with AI-powered analysis.

---

## What is GeoTrack?

GeoTrack is a next-generation global intelligence dashboard built for real-time situational awareness. It aggregates data from 12+ APIs across news, conflicts, markets, and military activity into a single, unified interface — powered by AI analysis and live data feeds.

Think: **Palantir meets Linear meets the Vercel dashboard**, rendered in liquid glass.

### Key Features

- **AI Brief** — AI-generated world summary powered by Groq, updated hourly
- **Live News Feed** — Aggregated from 40+ RSS sources, clustered with Jaccard similarity, and threat-classified
- **Country Instability Index (CII)** — Composite risk scores computed from news volume, conflict data, and signal density
- **Signal Detection** — Convergence alerts when multiple intelligence streams indicate the same threat
- **Financial Markets** — Real-time stock and crypto tracking with sparkline visualizations
- **Conflict Tracker** — ACLED and UCDP conflict data with geospatial mapping
- **Interactive Map** — deck.gl + MapLibre GL for geospatial intelligence visualization
- **Command Palette** — `⌘K` fuzzy search across countries, signals, and news headlines

---

## Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Framework        | Next.js 16 (App Router)                   |
| UI               | React 19                                  |
| Styling          | Tailwind CSS v4                           |
| Components       | shadcn/ui                                 |
| Animation        | Framer Motion 12+                         |
| State            | Zustand                                   |
| Data Fetching    | SWR                                       |
| Charts           | Recharts                                  |
| Maps             | deck.gl + MapLibre GL + react-map-gl      |
| Icons            | Lucide React                              |
| Cache            | Upstash Redis                             |
| AI               | Groq SDK                                  |
| RSS Parsing      | fast-xml-parser                           |
| Package Manager  | Bun                                       |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- API keys (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/geotrack.git
cd geotrack

# Install dependencies
bun install
```

### Environment Variables

Create a `.env.local` file:

```env
GROQ_API_KEY=              # Required — https://console.groq.com
UPSTASH_REDIS_REST_URL=    # Required — https://upstash.com
UPSTASH_REDIS_REST_TOKEN=  # Required
FINNHUB_API_KEY=           # Optional — https://finnhub.io
ACLED_ACCESS_TOKEN=        # Optional — https://developer.acleddata.com
ACLED_EMAIL=               # Optional
```

### Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## Architecture

```
app/
├── (dashboard)/        # Dashboard layout group
│   ├── layout.tsx      # Sidebar + Header shell
│   └── page.tsx        # Main dashboard page
├── api/                # API routes (news, markets, signals, etc.)
├── layout.tsx          # Root layout with metadata & theme
└── globals.css         # Design tokens & global styles

components/             # Reusable UI components
lib/                    # Utilities, API clients, algorithms
public/                 # Static assets (logo, icons)
```
---

## License

MIT
