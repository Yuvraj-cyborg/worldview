"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Shield, TrendingUp, Newspaper, MapPin, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEL_HOTSPOTS, CONFLICT_ZONES, MILITARY_BASES, NUCLEAR_FACILITIES } from "@/lib/data/geo";

interface CountryModalProps {
  countryName: string | null;
  onClose: () => void;
}

interface CountryData {
  name: string;
  hotspots: typeof INTEL_HOTSPOTS;
  conflicts: typeof CONFLICT_ZONES;
  bases: typeof MILITARY_BASES;
  nuclearFacilities: typeof NUCLEAR_FACILITIES;
  threatLevel: "critical" | "high" | "elevated" | "moderate" | "low";
}

function getCountryData(name: string): CountryData {
  const n = name.toLowerCase();
  const hotspots = INTEL_HOTSPOTS.filter(
    (h) => h.location?.toLowerCase().includes(n) || h.name.toLowerCase().includes(n) || h.keywords?.some((k) => k.includes(n))
  );
  const conflicts = CONFLICT_ZONES.filter(
    (c) => c.name.toLowerCase().includes(n) || c.location.toLowerCase().includes(n) || c.parties.some((p) => p.toLowerCase().includes(n))
  );
  const bases = MILITARY_BASES.filter((b) => b.country.toLowerCase().includes(n) || b.name.toLowerCase().includes(n));
  const nuclearFacilities = NUCLEAR_FACILITIES.filter((f) => f.name.toLowerCase().includes(n));

  let threatLevel: CountryData["threatLevel"] = "low";
  const maxEsc = Math.max(0, ...hotspots.map((h) => h.escalationScore ?? 0));
  if (conflicts.length > 0 || maxEsc >= 5) threatLevel = "critical";
  else if (maxEsc >= 4) threatLevel = "high";
  else if (maxEsc >= 3) threatLevel = "elevated";
  else if (hotspots.length > 0 || bases.length > 5) threatLevel = "moderate";

  return { name, hotspots, conflicts, bases, nuclearFacilities, threatLevel };
}

const THREAT_COLORS = {
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  elevated: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  moderate: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  low: "text-green-400 bg-green-500/10 border-green-500/30",
};

export function CountryModal({ countryName, onClose }: CountryModalProps) {
  const [data, setData] = useState<CountryData | null>(null);

  useEffect(() => {
    if (countryName) {
      setData(getCountryData(countryName));
    } else {
      setData(null);
    }
  }, [countryName]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!countryName || !data) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-md h-full bg-card border-l border-border overflow-y-auto animate-in slide-in-from-right-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <MapPin className="size-4 text-wv-accent" />
                {data.name}
              </h2>
              <div className={cn("inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border", THREAT_COLORS[data.threatLevel])}>
                <AlertTriangle className="size-3" />
                {data.threatLevel}
              </div>
            </div>
            <button onClick={onClose} className="size-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Active Conflicts */}
          {data.conflicts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
                <Shield className="size-3.5" /> Active Conflicts ({data.conflicts.length})
              </h3>
              <div className="space-y-2">
                {data.conflicts.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                      {c.casualties && <span>Casualties: {c.casualties}</span>}
                      {c.displaced && <span>Displaced: {c.displaced}</span>}
                    </div>
                    {c.startDate && <p className="text-[11px] text-muted-foreground mt-1">Since {c.startDate}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Intelligence Hotspots */}
          {data.hotspots.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2 mb-2">
                <Activity className="size-3.5" /> Intelligence Hotspots ({data.hotspots.length})
              </h3>
              <div className="space-y-2">
                {data.hotspots.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{h.name} — {h.subtext}</p>
                      {h.escalationScore && (
                        <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded", h.escalationScore >= 4 ? "bg-red-500/20 text-red-400" : h.escalationScore >= 3 ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400")}>
                          ESC {h.escalationScore}/5
                        </span>
                      )}
                    </div>
                    {h.whyItMatters && <p className="text-xs text-muted-foreground mt-1">{h.whyItMatters}</p>}
                    {h.escalationIndicators && h.escalationIndicators.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {h.escalationIndicators.slice(0, 4).map((ind, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-muted-foreground/50" />{ind}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Military Presence */}
          {data.bases.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2 mb-2">
                <Shield className="size-3.5" /> Military Presence ({data.bases.length} bases)
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {data.bases.slice(0, 12).map((b) => (
                  <div key={b.id} className="text-[11px] px-2 py-1.5 rounded bg-blue-500/5 border border-blue-500/15 truncate">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted-foreground ml-1">({b.type})</span>
                  </div>
                ))}
                {data.bases.length > 12 && (
                  <div className="text-[11px] px-2 py-1.5 text-muted-foreground">+{data.bases.length - 12} more</div>
                )}
              </div>
            </section>
          )}

          {/* Nuclear Facilities */}
          {data.nuclearFacilities.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2 mb-2">
                <TrendingUp className="size-3.5" /> Nuclear ({data.nuclearFacilities.length})
              </h3>
              <div className="space-y-1.5">
                {data.nuclearFacilities.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-purple-500/5 border border-purple-500/15">
                    <span className="font-medium">{f.name}</span>
                    <span className={cn("text-[10px] uppercase font-mono", f.status === "contested" ? "text-red-400" : f.status === "active" ? "text-green-400" : "text-muted-foreground")}>
                      {f.type} — {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* If nothing found */}
          {data.conflicts.length === 0 && data.hotspots.length === 0 && data.bases.length === 0 && data.nuclearFacilities.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="size-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No specific intelligence data available for {data.name}.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try searching for a different country or region.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
