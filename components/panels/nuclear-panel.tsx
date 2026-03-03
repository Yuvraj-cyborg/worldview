"use client";

import { Panel } from "@/components/ui/panel";
import { Radiation, MapPin } from "lucide-react";
import { NUCLEAR_FACILITIES } from "@/lib/data/geo";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  weapons: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  enrichment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  plant: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-positive",
  inactive: "text-text-muted",
  contested: "text-threat-critical",
};

export function NuclearPanel() {
  const byType = {
    weapons: NUCLEAR_FACILITIES.filter((f) => f.type === "weapons"),
    enrichment: NUCLEAR_FACILITIES.filter((f) => f.type === "enrichment"),
    plant: NUCLEAR_FACILITIES.filter((f) => f.type === "plant"),
  };

  return (
    <Panel
      title="Nuclear Facilities"
      icon={<Radiation className="size-4" />}
      timestamp={`${NUCLEAR_FACILITIES.length} tracked`}
      noPadding
    >
      <div className="divide-y divide-border/50 overflow-y-auto">
        {(["weapons", "enrichment", "plant"] as const).map((type) => (
          <div key={type}>
            <div className="px-4 py-2 bg-surface-1">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {type === "weapons" ? "Weapons Programs" : type === "enrichment" ? "Enrichment" : "Power Plants"}
              </span>
              <span className="text-[11px] font-mono text-text-muted ml-2">({byType[type].length})</span>
            </div>
            {byType[type].map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", STATUS_STYLES[f.status] === "text-positive" ? "bg-positive" : STATUS_STYLES[f.status] === "text-threat-critical" ? "bg-threat-critical" : "bg-text-muted")} />
                  <div>
                    <p className="text-sm text-text-primary">{f.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                      <MapPin className="size-2.5" />
                      <span>{f.lat.toFixed(2)}, {f.lon.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", TYPE_STYLES[f.type])}>
                    {f.type}
                  </span>
                  <span className={cn("text-[10px] font-mono", STATUS_STYLES[f.status])}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}
