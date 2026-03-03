"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/format";

interface Earthquake {
  id: string;
  place: string;
  magnitude: number;
  lat: number;
  lon: number;
  depth: number;
  time: string;
  url: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getMagnitudeColor(mag: number) {
  if (mag >= 7) return "text-threat-critical bg-threat-critical/10";
  if (mag >= 6) return "text-threat-high bg-threat-high/10";
  if (mag >= 5) return "text-threat-medium bg-threat-medium/10";
  if (mag >= 4) return "text-threat-low bg-threat-low/10";
  return "text-text-muted bg-muted";
}

export function EarthquakesPanel() {
  const { data, isLoading } = useSWR<{ earthquakes: Earthquake[]; count: number }>(
    "/api/geo/earthquakes",
    fetcher,
    { refreshInterval: 300_000 }
  );

  const quakes = data?.earthquakes ?? [];
  const significant = quakes.filter((q) => q.magnitude >= 5);

  return (
    <Panel
      title="Seismic Activity"
      icon={<Activity className="size-4" />}
      timestamp={isLoading ? undefined : `${quakes.length} events (24h)`}
      noPadding
    >
      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={6} /></div>
      ) : quakes.length === 0 ? (
        <div className="p-4 text-sm text-text-muted">No recent seismic data.</div>
      ) : (
        <div>
          {significant.length > 0 && (
            <div className="px-4 py-2 bg-threat-high/5 border-b border-border text-[12px] text-threat-high font-medium">
              {significant.length} significant (M5+) in last 24h
            </div>
          )}
          <div className="divide-y divide-border/50 overflow-y-auto">
            {quakes.slice(0, 25).map((eq) => (
              <a
                key={eq.id}
                href={eq.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
              >
                <span className={cn(
                  "text-sm font-mono font-bold min-w-[44px] text-center py-0.5 rounded",
                  getMagnitudeColor(eq.magnitude)
                )}>
                  {eq.magnitude.toFixed(1)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{eq.place}</p>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span>{eq.depth}km deep</span>
                    <span>·</span>
                    <span className="font-mono font-data">{timeAgo(new Date(eq.time))}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
