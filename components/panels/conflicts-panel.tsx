"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Shield, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONFLICT_ZONES } from "@/lib/data/geo";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const INTENSITY_STYLES = {
  high: "border-l-threat-critical bg-threat-critical/5",
  medium: "border-l-threat-high bg-threat-high/5",
  low: "border-l-threat-medium bg-threat-medium/5",
};

const INTENSITY_DOT = {
  high: "bg-threat-critical",
  medium: "bg-threat-high",
  low: "bg-threat-medium",
};

export function ConflictsPanel() {
  const { data: ucdpData, isLoading } = useSWR<{
    events: Array<{ country: string; deathsBest: number; sideA: string; sideB: string; dateStart: string }>;
  }>("/api/conflicts/ucdp", fetcher, { refreshInterval: 21_600_000 });

  const ucdpEvents = ucdpData?.events ?? [];

  const enrichedZones = CONFLICT_ZONES.map((zone) => {
    const related = ucdpEvents.filter((e) => {
      const lcCountry = e.country?.toLowerCase() ?? "";
      return zone.name.toLowerCase().includes(lcCountry) ||
             zone.description.toLowerCase().includes(lcCountry) ||
             zone.parties.some((p) => lcCountry.includes(p.toLowerCase()));
    });
    return {
      ...zone,
      ucdpCount: related.length,
      recentDeaths: related.reduce((s, e) => s + (e.deathsBest || 0), 0),
    };
  });

  return (
    <Panel
      title="Active Conflicts"
      icon={<Shield className="size-4" />}
      timestamp={`${enrichedZones.length} zones${ucdpEvents.length > 0 ? ` · ${ucdpEvents.length} UCDP events` : ""}`}
    >
      {isLoading ? (
        <PanelSkeleton rows={6} />
      ) : (
        <div className="space-y-2">
          {enrichedZones.map((zone) => (
            <div
              key={zone.id}
              className={cn(
                "rounded-lg border border-border p-3 border-l-2",
                INTENSITY_STYLES[zone.intensity]
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", INTENSITY_DOT[zone.intensity])} />
                  <span className="text-sm font-semibold text-text-primary">{zone.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <MapPin className="size-3" />
                  <span>{zone.location}</span>
                </div>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed">{zone.description}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {zone.parties.slice(0, 3).map((party) => (
                  <span key={party} className="text-[10px] font-medium text-text-muted bg-muted px-1.5 py-0.5 rounded">
                    {party}
                  </span>
                ))}
                {zone.ucdpCount > 0 && (
                  <span className="text-[10px] font-mono text-wv-accent ml-auto">
                    {zone.ucdpCount} UCDP events
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
