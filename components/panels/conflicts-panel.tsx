"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Shield, MapPin, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ACLEDEvent {
  id: string;
  date: string;
  type: string;
  subType: string;
  actor1: string;
  actor2: string;
  country: string;
  region: string;
  admin1: string;
  location: string;
  lat: number;
  lon: number;
  fatalities: number;
  notes: string;
  source: string;
}

interface CountrySummary {
  country: string;
  count: number;
  fatalities: number;
}

interface ACLEDData {
  events: ACLEDEvent[];
  totalCount: number;
  countrySummary: CountrySummary[];
  fetchedCount: number;
  error?: string;
}

interface UCDPData {
  events: Array<{
    country: string;
    deathsBest: number;
    sideA: string;
    sideB: string;
    dateStart: string;
  }>;
}

const INTENSITY_STYLES: Record<string, string> = {
  high: "border-l-threat-critical bg-threat-critical/5",
  medium: "border-l-threat-high bg-threat-high/5",
  low: "border-l-threat-medium bg-threat-medium/5",
};

const INTENSITY_DOT: Record<string, string> = {
  high: "bg-threat-critical",
  medium: "bg-threat-high",
  low: "bg-threat-medium",
};

function getIntensity(fatalities: number, eventCount: number): "high" | "medium" | "low" {
  if (fatalities > 100 || eventCount > 20) return "high";
  if (fatalities > 20 || eventCount > 5) return "medium";
  return "low";
}

export function ConflictsPanel() {
  const { data: acledData, isLoading: acledLoading } = useSWR<ACLEDData>(
    "/api/conflicts/acled",
    fetcher,
    { refreshInterval: 3_600_000 } // 1 hour
  );

  const { data: ucdpData, isLoading: ucdpLoading } = useSWR<UCDPData>(
    "/api/conflicts/ucdp",
    fetcher,
    { refreshInterval: 21_600_000 } // 6 hours
  );

  const isLoading = acledLoading || ucdpLoading;
  const countrySummary = acledData?.countrySummary ?? [];
  const ucdpEvents = ucdpData?.events ?? [];
  const hasACLED = countrySummary.length > 0;

  // Merge UCDP data with ACLED country summaries
  const enrichedCountries = countrySummary.map((cs) => {
    const ucdpRelated = ucdpEvents.filter(
      (e) => e.country?.toLowerCase() === cs.country.toLowerCase()
    );
    return {
      ...cs,
      ucdpCount: ucdpRelated.length,
      ucdpDeaths: ucdpRelated.reduce((s, e) => s + (e.deathsBest || 0), 0),
      intensity: getIntensity(cs.fatalities, cs.count),
    };
  });

  const totalEvents = acledData?.fetchedCount ?? 0;
  const totalFatalities = countrySummary.reduce((s, c) => s + c.fatalities, 0);

  return (
    <Panel
      title="Active Conflicts"
      icon={<Shield className="size-4" />}
      timestamp={
        hasACLED
          ? `${totalEvents} events · ${totalFatalities.toLocaleString()} fatalities (90d)`
          : ucdpEvents.length > 0
            ? `${ucdpEvents.length} UCDP events`
            : undefined
      }
    >
      {isLoading ? (
        <PanelSkeleton rows={6} />
      ) : !hasACLED && ucdpEvents.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No conflict data available. Check ACLED API token in settings.
        </div>
      ) : (
        <div className="space-y-2">
          {enrichedCountries.map((zone) => (
            <div
              key={zone.country}
              className={cn(
                "rounded-lg border border-border p-3 border-l-2",
                INTENSITY_STYLES[zone.intensity]
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      INTENSITY_DOT[zone.intensity]
                    )}
                  />
                  <span className="text-sm font-semibold text-text-primary">
                    {zone.country}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="font-mono">{zone.count} events</span>
                  {zone.fatalities > 0 && (
                    <span className="flex items-center gap-0.5 text-threat-critical font-mono font-medium">
                      <Skull className="size-3" />
                      {zone.fatalities.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] font-medium text-text-muted bg-muted px-1.5 py-0.5 rounded uppercase">
                  ACLED
                </span>
                {zone.ucdpCount > 0 && (
                  <span className="text-[10px] font-mono text-wv-accent bg-wv-accent/10 px-1.5 py-0.5 rounded">
                    +{zone.ucdpCount} UCDP
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Show UCDP-only countries not in ACLED */}
          {ucdpEvents
            .filter(
              (e) =>
                !countrySummary.some(
                  (cs) =>
                    cs.country.toLowerCase() === e.country?.toLowerCase()
                )
            )
            .reduce<
              Array<{
                country: string;
                count: number;
                deaths: number;
              }>
            >((acc, e) => {
              const existing = acc.find(
                (a) => a.country === e.country
              );
              if (existing) {
                existing.count++;
                existing.deaths += e.deathsBest || 0;
              } else {
                acc.push({
                  country: e.country,
                  count: 1,
                  deaths: e.deathsBest || 0,
                });
              }
              return acc;
            }, [])
            .sort((a, b) => b.deaths - a.deaths)
            .slice(0, 10)
            .map((zone) => (
              <div
                key={`ucdp-${zone.country}`}
                className="rounded-lg border border-border p-3 border-l-2 border-l-threat-medium bg-threat-medium/5"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-threat-medium" />
                    <span className="text-sm font-semibold text-text-primary">
                      {zone.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span className="font-mono">
                      {zone.count} events
                    </span>
                    {zone.deaths > 0 && (
                      <span className="flex items-center gap-0.5 text-threat-critical font-mono font-medium">
                        <Skull className="size-3" />
                        {zone.deaths.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-mono text-wv-accent bg-wv-accent/10 px-1.5 py-0.5 rounded">
                    UCDP only
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </Panel>
  );
}
