"use client";

import { useState } from "react";
import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { ThreatBadge } from "@/components/intelligence/threat-badge";
import { Newspaper, ChevronDown, ExternalLink } from "lucide-react";
import type { ClusteredEvent, ThreatLevel } from "@/lib/types";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface NewsData {
  clusters: ClusteredEvent[];
  totalItems: number;
  feedsLoaded: number;
}

const fetcher = async (url: string) => {
  const resp = await fetch(url);
  const json = await resp.json();
  json.clusters = json.clusters?.map((c: Record<string, unknown>) => ({
    ...c,
    firstSeen: new Date(c.firstSeen as string),
    lastUpdated: new Date(c.lastUpdated as string),
  })) ?? [];
  return json;
};

const VELOCITY_ICONS: Record<string, string> = {
  spike: "▲",
  elevated: "↗",
  normal: "→",
};

const TABS = [
  { id: "all", label: "All" },
  { id: "politics", label: "World" },
  { id: "us", label: "US" },
  { id: "europe", label: "Europe" },
  { id: "middleeast", label: "MENA" },
  { id: "asia", label: "Asia" },
  { id: "africa", label: "Africa" },
  { id: "latam", label: "LatAm" },
  { id: "crisis", label: "Crisis" },
  { id: "defense", label: "Defense" },
  { id: "finance", label: "Finance" },
  { id: "energy", label: "Energy" },
  { id: "tech", label: "Tech" },
  { id: "ai", label: "AI" },
  { id: "thinktanks", label: "Think Tanks" },
  { id: "gov", label: "Government" },
  { id: "layoffs", label: "Layoffs" },
];

function NewsItemRow({
  cluster,
  expanded,
  onToggle,
}: {
  cluster: ClusteredEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const threatLevel = (cluster.threat?.level ?? "info") as ThreatLevel;
  const velocity = cluster.velocity;
  const pubDate = new Date(cluster.lastUpdated);

  return (
    <div className="group">
      <button
        onClick={onToggle}
        className={cn(
          "w-full text-left px-3 py-2.5 rounded-lg transition-colors",
          "hover:bg-muted/50",
          expanded && "bg-muted/30"
        )}
      >
        <div className="flex items-start gap-2">
          <ThreatBadge level={threatLevel} compact className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-text-primary line-clamp-2">
              {cluster.primaryTitle}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
              <span>{cluster.primarySource}</span>
              {cluster.sourceCount > 1 && (
                <>
                  <span>·</span>
                  <span className="font-medium">{cluster.sourceCount} sources</span>
                </>
              )}
              <span>·</span>
              <span className="font-mono font-data">{timeAgo(pubDate)}</span>
              {velocity && velocity.level !== "normal" && (
                <>
                  <span>·</span>
                  <span className={cn(
                    "font-medium",
                    velocity.level === "spike" ? "text-threat-critical" : "text-threat-high"
                  )}>
                    {VELOCITY_ICONS[velocity.level]} {velocity.level}
                  </span>
                </>
              )}
              {cluster.category && (
                <>
                  <span>·</span>
                  <span className="text-wv-accent uppercase text-[9px] tracking-wider font-semibold">{cluster.category}</span>
                </>
              )}
            </div>
          </div>
          {cluster.sourceCount > 1 && (
            <ChevronDown
              className={cn(
                "size-3.5 text-text-muted shrink-0 mt-1 transition-transform",
                expanded && "rotate-180"
              )}
            />
          )}
        </div>
      </button>

      {expanded && cluster.sourceCount > 1 && (
        <div className="ml-4 pl-3 border-l border-border space-y-1.5 py-2 mb-1">
          {cluster.topSources.slice(0, 5).map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] text-text-secondary hover:text-wv-accent transition-colors"
            >
              <ExternalLink className="size-3 shrink-0" />
              <span className="truncate">{src.name}</span>
              <span className="text-text-muted font-mono">T{src.tier}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function NewsPanel() {
  const { data, isLoading } = useSWR<NewsData>(
    "/api/news/feeds",
    fetcher,
    { refreshInterval: 60_000 }
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(15);
  const [activeTab, setActiveTab] = useState("all");

  const clusters = data?.clusters ?? [];
  const filtered = activeTab === "all"
    ? clusters
    : clusters.filter((c) => c.category === activeTab);

  return (
    <Panel
      title="News Feed"
      icon={<Newspaper className="size-4" />}
      timestamp={data ? `${data.feedsLoaded} feeds · ${data.totalItems} items` : undefined}
      noPadding
    >
      {isLoading ? (
        <div className="p-4">
          <PanelSkeleton rows={8} />
        </div>
      ) : clusters.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No news data available. Check your network connection.
        </div>
      ) : (
        <div>
          <div className="flex gap-1 px-3 pt-3 pb-2 overflow-x-auto border-b border-border/50">
            {TABS.map((t) => {
              const count = t.id === "all" ? clusters.length : clusters.filter((c) => c.category === t.id).length;
              if (count === 0 && t.id !== "all") return null;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setShowCount(15); }}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors",
                    activeTab === t.id
                      ? "bg-wv-accent text-white"
                      : "text-text-muted hover:text-text-primary bg-surface-1 hover:bg-surface-2"
                  )}
                >
                  {t.label}
                  <span className="ml-1 text-[9px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-border/50 px-1 py-1">
            {filtered.slice(0, showCount).map((cluster) => (
              <NewsItemRow
                key={cluster.id}
                cluster={cluster}
                expanded={expandedId === cluster.id}
                onToggle={() => setExpandedId(expandedId === cluster.id ? null : cluster.id)}
              />
            ))}
          </div>
          {filtered.length > showCount && (
            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={() => setShowCount((c) => c + 15)}
                className="text-xs font-medium text-wv-accent hover:text-wv-accent-hover transition-colors"
              >
                Show more ({filtered.length - showCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
