"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Globe, Newspaper, BarChart3, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "country" | "signal" | "news" | "market";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
}

const STATIC_RESULTS: SearchResult[] = [
  { id: "ua", type: "country", title: "Ukraine", subtitle: "CII: 89 — CRITICAL", icon: Globe },
  { id: "sd", type: "country", title: "Sudan", subtitle: "CII: 85 — CRITICAL", icon: Globe },
  { id: "ps", type: "country", title: "Palestine", subtitle: "CII: 84 — CRITICAL", icon: Globe },
  { id: "ir", type: "country", title: "Iran", subtitle: "Focal Point — CRITICAL", icon: Target },
  { id: "tw", type: "country", title: "Taiwan", subtitle: "Focal Point — ELEVATED", icon: Target },
  { id: "mm", type: "country", title: "Myanmar", subtitle: "CII: 78 — HIGH", icon: Globe },
  { id: "btc", type: "market", title: "Bitcoin", subtitle: "Crypto", icon: TrendingUp },
  { id: "eth", type: "market", title: "Ethereum", subtitle: "Crypto", icon: TrendingUp },
  { id: "spy", type: "market", title: "S&P 500", subtitle: "Index", icon: BarChart3 },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? STATIC_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_RESULTS;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

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
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results.length, onClose]
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
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search countries, signals, markets..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={onClose}
              className="size-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
            >
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
                    i === selectedIndex
                      ? "bg-wv-accent-muted text-foreground"
                      : "hover:bg-muted/50"
                  )}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <result.icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-[11px] text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
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
