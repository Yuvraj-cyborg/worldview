"use client";

import useSWR from "swr";
import Link from "next/link";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { ThreatBadge } from "@/components/intelligence/threat-badge";
import { BarChart3, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { ThreatLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CIICountry {
  code: string;
  name: string;
  flag: string;
  score: number;
  level: ThreatLevel;
  trend: "rising" | "stable" | "falling";
  change: number;
  newsMentions: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type SortKey = "score" | "name" | "change";

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "rising") return <ArrowUp className="size-3 text-negative" />;
  if (trend === "falling") return <ArrowDown className="size-3 text-positive" />;
  return <Minus className="size-3 text-text-muted" />;
};

export function CIIPanel() {
  const { data, isLoading } = useSWR<{ countries: CIICountry[] }>(
    "/api/intelligence/cii",
    fetcher,
    { refreshInterval: 3_600_000 }
  );
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);

  const countries = data?.countries ?? [];

  const sorted = [...countries].sort((a, b) => {
    let diff = 0;
    if (sortKey === "score") diff = b.score - a.score;
    else if (sortKey === "name") diff = a.name.localeCompare(b.name);
    else if (sortKey === "change") diff = Math.abs(b.change) - Math.abs(a.change);
    return sortAsc ? -diff : diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <Panel
      title="Country Instability Index"
      icon={<BarChart3 className="size-4" />}
      noPadding
    >
      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={8} /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase text-text-muted border-b border-border">
                <th className="text-left px-4 py-2 font-medium">
                  <button onClick={() => handleSort("name")} className="hover:text-foreground transition-colors">Country</button>
                </th>
                <th className="text-right px-3 py-2 font-medium">
                  <button onClick={() => handleSort("score")} className="hover:text-foreground transition-colors">CII</button>
                </th>
                <th className="text-right px-3 py-2 font-medium">
                  <button onClick={() => handleSort("change")} className="hover:text-foreground transition-colors">24h</button>
                </th>
                <th className="text-center px-3 py-2 font-medium">Level</th>
                <th className="hidden sm:table-cell px-3 py-2 font-medium text-left">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((country) => (
                <tr key={country.code} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">
                    <Link href={`/country/${country.code.toLowerCase()}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <span className="text-base">{country.flag}</span>
                      <div>
                        <span className="font-medium text-text-primary hover:text-wv-accent transition-colors">{country.name}</span>
                        {country.newsMentions > 0 && (
                          <span className="text-[10px] text-text-muted ml-1.5">{country.newsMentions} mentions</span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="text-right px-3 py-2 font-mono font-data font-semibold text-text-primary">{country.score}</td>
                  <td className="text-right px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <TrendIcon trend={country.trend} />
                      <span className={cn(
                        "font-mono font-data text-xs",
                        country.change > 0 ? "text-negative" : country.change < 0 ? "text-positive" : "text-text-muted"
                      )}>
                        {country.change > 0 ? "+" : ""}{country.change.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2"><ThreatBadge level={country.level} compact /></td>
                  <td className="hidden sm:table-cell px-3 py-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          country.level === "critical" ? "bg-threat-critical" :
                          country.level === "high" ? "bg-threat-high" :
                          country.level === "medium" ? "bg-threat-medium" : "bg-threat-low"
                        )}
                        style={{ width: `${country.score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
