"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import {
  Radio, AlertTriangle, Activity, Newspaper, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Signal {
  type: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "high";
  countries: string[];
  source: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ICON_MAP: Record<string, React.ElementType> = {
  earthquake: Activity,
  conflict: AlertTriangle,
  threat_intel: AlertTriangle,
  news_volume: Newspaper,
};

const SEVERITY_COLORS = {
  low: "bg-threat-low/10 text-threat-low border-threat-low/20",
  medium: "bg-threat-medium/10 text-threat-medium border-threat-medium/20",
  high: "bg-threat-high/10 text-threat-high border-threat-high/20",
};

export function SignalsPanel() {
  const { data, isLoading } = useSWR<{ signals: Signal[]; totalSignals: number }>(
    "/api/intelligence/signals",
    fetcher,
    { refreshInterval: 600_000 }
  );

  const signals = data?.signals ?? [];
  const totalSignals = data?.totalSignals ?? 0;
  const highSeverity = signals.filter((s) => s.severity === "high").length;

  return (
    <Panel
      title="Signal Overview"
      icon={<Radio className="size-4" />}
      timestamp={isLoading ? undefined : `${totalSignals} signals`}
    >
      {isLoading ? (
        <PanelSkeleton rows={5} />
      ) : signals.length === 0 ? (
        <p className="text-sm text-text-muted">No signal data available.</p>
      ) : (
        <>
          <div className="space-y-3">
            {signals.map((signal) => {
              const Icon = ICON_MAP[signal.type] ?? BarChart2;
              return (
                <div key={signal.type} className="flex items-start gap-3">
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                    SEVERITY_COLORS[signal.severity]
                  )}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">{signal.label}</p>
                      <span className="font-mono font-data text-sm font-semibold text-text-primary">{signal.count}</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5 truncate">
                      {signal.countries.length > 0
                        ? signal.countries.join(" · ")
                        : signal.source}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {highSeverity > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-threat-high">
                <AlertTriangle className="size-3.5" />
                <span className="font-medium">{highSeverity} high-severity signal type{highSeverity > 1 ? "s" : ""} active</span>
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
