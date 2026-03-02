"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Flame, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FireCluster {
  lat: number;
  lon: number;
  brightness: number;
  confidence: string;
  acqDate: string;
  satellite: string;
  country?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getBrightnessColor(b: number) {
  if (b >= 400) return "text-threat-critical";
  if (b >= 350) return "text-threat-high";
  if (b >= 320) return "text-threat-medium";
  return "text-threat-low";
}

export function FiresPanel() {
  const { data, isLoading, error } = useSWR<{ fires: FireCluster[]; count: number }>(
    "/api/military/fires",
    fetcher,
    { refreshInterval: 3_600_000 }
  );

  const fires = data?.fires ?? [];
  const highConfidence = fires.filter((f) => f.confidence === "high" || f.confidence === "nominal");

  return (
    <Panel
      title="Satellite Fires"
      icon={<Flame className="size-4" />}
      timestamp={data ? `${data.count} detections` : undefined}
      noPadding
    >
      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={6} /></div>
      ) : error || fires.length === 0 ? (
        <div className="p-4">
          <p className="text-sm text-text-muted">
            {error ? "NASA FIRMS API requires an API key." : "No fire data available."}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            Get a free key at firms.modaps.eosdis.nasa.gov
          </p>
        </div>
      ) : (
        <div>
          <div className="px-4 py-2 bg-threat-high/5 border-b border-border">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-muted">High-confidence detections</span>
              <span className="font-mono text-threat-high font-semibold">{highConfidence.length}</span>
            </div>
          </div>
          <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
            {fires.slice(0, 30).map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors">
                <span className={cn("text-sm font-mono font-bold min-w-[44px] text-center", getBrightnessColor(f.brightness))}>
                  {f.brightness.toFixed(0)}K
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] text-text-muted">
                    <MapPin className="size-2.5" />
                    <span>{f.lat.toFixed(2)}, {f.lon.toFixed(2)}</span>
                    {f.country && <span className="ml-1">({f.country})</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                    <span>{f.satellite}</span>
                    <span>·</span>
                    <span className={cn(
                      "font-medium",
                      f.confidence === "high" ? "text-threat-high" : f.confidence === "nominal" ? "text-threat-medium" : ""
                    )}>
                      {f.confidence}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{f.acqDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
