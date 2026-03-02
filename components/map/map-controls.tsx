"use client";

import { Layers, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { MapLayers } from "./world-map";

interface MapControlsProps {
  currentView: string;
  onViewChange: (view: string) => void;
  layers: MapLayers;
  onToggleLayer: (key: keyof MapLayers) => void;
  earthquakeCount: number;
  newsCount: number;
  ucdpCount: number;
}

const VIEWS = [
  { id: "global", label: "Global" },
  { id: "india", label: "India" },
  { id: "americas", label: "Americas" },
  { id: "europe", label: "Europe" },
  { id: "mena", label: "MENA" },
  { id: "asia", label: "Asia" },
  { id: "africa", label: "Africa" },
];

const LAYER_CONFIG: { key: keyof MapLayers; label: string; color: string }[] = [
  { key: "hotspots", label: "Hotspots", color: "#f97316" },
  { key: "conflicts", label: "Conflicts", color: "#ef4444" },
  { key: "ucdp", label: "UCDP Events", color: "#dc2626" },
  { key: "bases", label: "Mil. Bases", color: "#3b82f6" },
  { key: "nuclear", label: "Nuclear", color: "#a855f7" },
  { key: "cables", label: "Subsea Cables", color: "#06b6d4" },
  { key: "pipelines", label: "Pipelines", color: "#b45028" },
  { key: "waterways", label: "Waterways", color: "#22d3ee" },
  { key: "economic", label: "Economic", color: "#22c55e" },
  { key: "earthquakes", label: "Earthquakes", color: "#eab308" },
  { key: "daynight", label: "Day/Night", color: "#475569" },
];

export function MapControls({
  currentView,
  onViewChange,
  layers,
  onToggleLayer,
  earthquakeCount,
  newsCount,
  ucdpCount,
}: MapControlsProps) {
  const [layersOpen, setLayersOpen] = useState(false);

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <>
      <div className="absolute top-3 left-3 flex gap-1 bg-surface-1/90 backdrop-blur-sm rounded-lg border border-border p-1 z-10">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors",
              currentView === v.id
                ? "bg-wv-accent text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-surface-1/90 backdrop-blur-sm rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
        >
          <Layers className="size-3.5" />
          Layers ({activeCount})
          <ChevronDown className={cn("size-3 transition-transform", layersOpen && "rotate-180")} />
        </button>

        {layersOpen && (
          <div className="mt-1 bg-surface-1/95 backdrop-blur-sm rounded-lg border border-border p-2 min-w-[170px]">
            {LAYER_CONFIG.map((l) => (
              <label
                key={l.key}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={layers[l.key]}
                  onChange={() => onToggleLayer(l.key)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "size-3 rounded-sm border transition-colors",
                    layers[l.key] ? "border-transparent" : "border-border bg-surface-2"
                  )}
                  style={layers[l.key] ? { backgroundColor: l.color } : {}}
                />
                <span className="text-[11px] text-text-secondary">{l.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] font-mono text-text-muted bg-surface-0/80 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-border z-10">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </span>
        <span className="text-border">|</span>
        <span>{earthquakeCount} quakes</span>
        <span className="text-border">|</span>
        <span>{ucdpCount} conflict events</span>
        <span className="text-border">|</span>
        <span>{newsCount} stories</span>
      </div>
    </>
  );
}
