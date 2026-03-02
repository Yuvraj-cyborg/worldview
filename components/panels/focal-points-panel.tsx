"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Target, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEL_HOTSPOTS } from "@/lib/data/geo";

interface NewsCluster {
  id: string;
  primaryTitle: string;
  primaryLink: string;
  primarySource: string;
  sourceCount: number;
  threat?: { level: string; score: number };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const URGENCY_STYLES = {
  critical: "border-l-threat-critical",
  elevated: "border-l-threat-high",
  watch: "border-l-threat-low",
};

const URGENCY_LABELS = {
  critical: "CRITICAL",
  elevated: "ELEVATED",
  watch: "WATCH",
};

const URGENCY_COLORS = {
  critical: "text-threat-critical",
  elevated: "text-threat-high",
  watch: "text-threat-low",
};

export function FocalPointsPanel() {
  const { data: newsData, isLoading } = useSWR<{ clusters: NewsCluster[] }>(
    "/api/news/feeds",
    fetcher,
    { refreshInterval: 600_000 }
  );

  const clusters = newsData?.clusters ?? [];

  const focalPoints = INTEL_HOTSPOTS
    .filter((h) => h.keywords && h.keywords.length > 0)
    .map((hotspot) => {
      const matchedHeadlines = clusters.filter((c) =>
        hotspot.keywords!.some((kw) => c.primaryTitle.toLowerCase().includes(kw))
      );

      const newsMentions = matchedHeadlines.length;
      const avgThreat = matchedHeadlines.reduce((s, c) => s + (c.threat?.score ?? 0), 0) / Math.max(newsMentions, 1);
      const topHeadline = matchedHeadlines.sort((a, b) => (b.threat?.score ?? 0) - (a.threat?.score ?? 0))[0];

      const escalation = hotspot.escalationScore ?? 1;
      const score = Math.min(100, Math.round(escalation * 12 + newsMentions * 3 + avgThreat * 0.5));

      const urgency: "critical" | "elevated" | "watch" =
        score >= 70 || escalation >= 5 ? "critical" :
        score >= 40 || escalation >= 3 ? "elevated" : "watch";

      return {
        id: hotspot.id,
        name: hotspot.name,
        urgency,
        score,
        newsMentions,
        escalation,
        headline: topHeadline?.primaryTitle,
        headlineUrl: topHeadline?.primaryLink,
        whyItMatters: hotspot.whyItMatters,
      };
    })
    .filter((fp) => fp.score > 20 || fp.newsMentions > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <Panel
      title="Focal Points"
      icon={<Target className="size-4" />}
      timestamp={isLoading ? undefined : `${focalPoints.length} entities`}
    >
      {isLoading ? (
        <PanelSkeleton rows={5} />
      ) : focalPoints.length === 0 ? (
        <p className="text-sm text-text-muted">No focal points detected.</p>
      ) : (
        <div className="space-y-2">
          {focalPoints.map((fp) => (
            <div
              key={fp.id}
              className={cn(
                "rounded-lg border border-border bg-muted/20 p-3 border-l-2",
                URGENCY_STYLES[fp.urgency]
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{fp.name}</span>
                  <span className={cn("text-[10px] font-mono font-semibold", URGENCY_COLORS[fp.urgency])}>
                    {URGENCY_LABELS[fp.urgency]}
                  </span>
                </div>
                <span className="font-mono font-data text-sm font-bold text-text-primary">{fp.score}</span>
              </div>

              {fp.headline && (
                <a
                  href={fp.headlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[12px] text-wv-accent hover:text-wv-accent-hover transition-colors mb-1.5 line-clamp-1"
                >
                  <span className="truncate">{fp.headline}</span>
                  <ExternalLink className="size-2.5 shrink-0" />
                </a>
              )}

              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                <span>{fp.newsMentions} news</span>
                <span>·</span>
                <span>Esc. {fp.escalation}/5</span>
                {fp.whyItMatters && (
                  <>
                    <span>·</span>
                    <span className="truncate">{fp.whyItMatters}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
