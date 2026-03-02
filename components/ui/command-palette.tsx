"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Globe, Newspaper, BarChart3, Target, TrendingUp, MapPin, Shield, Activity, Crosshair, Flame, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEL_HOTSPOTS, CONFLICT_ZONES } from "@/lib/data/geo";

interface SearchResult {
  id: string;
  type: "country" | "panel" | "hotspot" | "conflict" | "market";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: string;
}

const PANEL_RESULTS: SearchResult[] = [
  { id: "p-news", type: "panel", title: "News Feed", subtitle: "Jump to panel", icon: Newspaper, action: "scroll:news" },
  { id: "p-focal", type: "panel", title: "Focal Points", subtitle: "Jump to panel", icon: Target, action: "scroll:focal" },
  { id: "p-conflicts", type: "panel", title: "Conflicts", subtitle: "Jump to panel", icon: Shield, action: "scroll:conflicts" },
  { id: "p-ucdp", type: "panel", title: "UCDP Events", subtitle: "Jump to panel", icon: Crosshair, action: "scroll:ucdp" },
  { id: "p-signals", type: "panel", title: "Signals", subtitle: "Jump to panel", icon: Radio, action: "scroll:signals" },
  { id: "p-cii", type: "panel", title: "CII Index", subtitle: "Jump to panel", icon: BarChart3, action: "scroll:cii" },
  { id: "p-quakes", type: "panel", title: "Earthquakes", subtitle: "Jump to panel", icon: Activity, action: "scroll:quakes" },
  { id: "p-markets", type: "panel", title: "Markets", subtitle: "Jump to panel", icon: TrendingUp, action: "scroll:markets" },
  { id: "p-fires", type: "panel", title: "Satellite Fires", subtitle: "Jump to panel", icon: Flame, action: "scroll:fires" },
];

const COUNTRY_RESULTS: SearchResult[] = [
  { id: "c-ua", type: "country", title: "Ukraine", subtitle: "CII: 89 — CRITICAL", icon: MapPin, action: "country:Ukraine" },
  { id: "c-sd", type: "country", title: "Sudan", subtitle: "CII: 85 — CRITICAL", icon: MapPin, action: "country:Sudan" },
  { id: "c-ps", type: "country", title: "Palestine", subtitle: "CII: 84 — CRITICAL", icon: MapPin, action: "country:Palestine" },
  { id: "c-ir", type: "country", title: "Iran", subtitle: "War Theater — CRITICAL", icon: MapPin, action: "country:Iran" },
  { id: "c-tw", type: "country", title: "Taiwan", subtitle: "Strait Watch — ELEVATED", icon: MapPin, action: "country:Taiwan" },
  { id: "c-mm", type: "country", title: "Myanmar", subtitle: "Civil War — HIGH", icon: MapPin, action: "country:Myanmar" },
  { id: "c-in", type: "country", title: "India", subtitle: "Intel Hub", icon: MapPin, action: "country:India" },
  { id: "c-cn", type: "country", title: "China", subtitle: "PLA/MSS Activity", icon: MapPin, action: "country:China" },
  { id: "c-ru", type: "country", title: "Russia", subtitle: "Kremlin Activity", icon: MapPin, action: "country:Russia" },
  { id: "c-us", type: "country", title: "United States", subtitle: "Pentagon Watch", icon: MapPin, action: "country:United States" },
  { id: "c-il", type: "country", title: "Israel", subtitle: "IDF Operations", icon: MapPin, action: "country:Israel" },
  { id: "c-lb", type: "country", title: "Lebanon", subtitle: "Hezbollah Activity", icon: MapPin, action: "country:Lebanon" },
  { id: "c-ye", type: "country", title: "Yemen", subtitle: "Red Sea Crisis", icon: MapPin, action: "country:Yemen" },
  { id: "c-sy", type: "country", title: "Syria", subtitle: "Multiple actors", icon: MapPin, action: "country:Syria" },
  { id: "c-kp", type: "country", title: "North Korea", subtitle: "DPRK Watch", icon: MapPin, action: "country:North Korea" },
  { id: "c-sa", type: "country", title: "Saudi Arabia", subtitle: "GIP/OPEC", icon: MapPin, action: "country:Saudi Arabia" },
];

const HOTSPOT_RESULTS: SearchResult[] = INTEL_HOTSPOTS.slice(0, 15).map((h) => ({
  id: `h-${h.id}`, type: "hotspot" as const, title: h.name, subtitle: h.subtext ?? h.location, icon: Globe, action: `country:${h.name}`,
}));

const MARKET_RESULTS: SearchResult[] = [
  { id: "m-btc", type: "market", title: "Bitcoin", subtitle: "Crypto", icon: TrendingUp, action: "scroll:markets" },
  { id: "m-eth", type: "market", title: "Ethereum", subtitle: "Crypto", icon: TrendingUp, action: "scroll:markets" },
  { id: "m-spy", type: "market", title: "S&P 500", subtitle: "Index", icon: BarChart3, action: "scroll:markets" },
];

const ALL_RESULTS = [...COUNTRY_RESULTS, ...HOTSPOT_RESULTS, ...PANEL_RESULTS, ...MARKET_RESULTS];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCountrySelect?: (name: string) => void;
}

export function CommandPalette({ open, onClose, onCountrySelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? ALL_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_RESULTS.slice(0, 12);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      const action = result.action;
      if (action.startsWith("scroll:")) {
        const sectionId = action.split(":")[1];
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (action.startsWith("country:")) {
        const name = action.split(":")[1];
        if (onCountrySelect) onCountrySelect(name);
      }
      onClose();
    },
    [onClose, onCountrySelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, onClose, handleSelect]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search countries, panels, signals, markets..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button onClick={onClose} className="size-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              results.map((result, i) => (
                <button
                  key={result.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === selectedIndex ? "bg-wv-accent-muted text-foreground" : "hover:bg-muted/50"
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <result.icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-[11px] text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 font-mono uppercase shrink-0">
                    {result.type}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
            <span><kbd className="font-mono px-1 py-0.5 bg-muted rounded border border-border">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono px-1 py-0.5 bg-muted rounded border border-border">↵</kbd> select</span>
            <span><kbd className="font-mono px-1 py-0.5 bg-muted rounded border border-border">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
