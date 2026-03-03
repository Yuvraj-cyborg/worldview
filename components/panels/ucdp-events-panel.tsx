"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Crosshair, MapPin, Skull } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UcdpEvent {
  id: string;
  lat: number;
  lon: number;
  country: string;
  sideA: string;
  sideB: string;
  deathsBest: number;
  type: string;
  dateStart: string;
  region: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TABS = [
  { id: "all", label: "All" },
  { id: "state-based", label: "State" },
  { id: "non-state", label: "Non-State" },
  { id: "one-sided", label: "One-Sided" },
];

const TYPE_COLORS: Record<string, string> = {
  "state-based": "bg-threat-critical/10 text-threat-critical",
  "non-state": "bg-threat-high/10 text-threat-high",
  "one-sided": "bg-threat-medium/10 text-threat-medium",
};

export function UcdpEventsPanel() {
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useSWR<{ events: UcdpEvent[] }>(
    "/api/conflicts/ucdp",
    fetcher,
    { refreshInterval: 21_600_000 }
  );

  const events = data?.events ?? [];
  const filtered = tab === "all" ? events : events.filter((e) => e.type === tab);

  const totalDeaths = events.reduce((s, e) => s + (e.deathsBest || 0), 0);
  const countrySet = new Set(events.map((e) => e.country));

  return (
    <Panel
      title="UCDP Conflict Events"
      icon={<Crosshair className="size-4" />}
      timestamp={`${events.length} events · ${countrySet.size} countries`}
      noPadding
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium rounded-md transition-colors",
                tab === t.id
                  ? "bg-wv-accent text-white"
                  : "text-text-muted hover:text-text-primary bg-surface-1 hover:bg-surface-2"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {totalDeaths > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-threat-high font-mono">
            <Skull className="size-3" />
            {totalDeaths.toLocaleString()}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={8} /></div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-text-muted">No events for this category.</div>
      ) : (
        <div className="divide-y divide-border/50 overflow-y-auto">
          {filtered.slice(0, 40).map((e) => (
            <div key={e.id} className="px-4 py-2.5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary leading-snug">
                    {e.sideA} <span className="text-text-muted">vs</span> {e.sideB}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                    <span className="flex items-center gap-0.5"><MapPin className="size-2.5" />{e.country}</span>
                    <span>·</span>
                    <span className="font-mono">{e.dateStart}</span>
                    {e.region && (
                      <>
                        <span>·</span>
                        <span>{e.region}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.deathsBest > 0 && (
                    <span className="text-[11px] font-mono text-threat-high">{e.deathsBest} deaths</span>
                  )}
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    TYPE_COLORS[e.type] ?? "bg-muted text-text-muted"
                  )}>
                    {e.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
