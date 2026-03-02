"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { ThreatBadge } from "@/components/intelligence/threat-badge";
import { FileText, Newspaper, BarChart3 } from "lucide-react";
import type { ThreatLevel } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CIICountry {
  code: string;
  name: string;
  score: number;
  level: ThreatLevel;
  trend: string;
  change: number;
  newsMentions: number;
}

export function CountryBrief({ code, name }: { code: string; name: string }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: ciiData } = useSWR<{ countries: CIICountry[] }>(
    "/api/intelligence/cii",
    fetcher
  );
  const { data: newsData } = useSWR<{
    clusters: Array<{ primaryTitle: string; primaryLink: string; threat?: { level: string } }>;
  }>("/api/news/feeds", fetcher);

  const countryInfo = ciiData?.countries?.find((c) => c.code === code);
  const keywords = name.toLowerCase().split(" ");
  const relatedNews = (newsData?.clusters ?? []).filter((c) =>
    keywords.some((kw) => c.primaryTitle.toLowerCase().includes(kw))
  );

  useEffect(() => {
    async function analyze() {
      if (!relatedNews.length && !countryInfo) return;
      setAnalyzing(true);
      try {
        const resp = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: name,
            context: countryInfo
              ? `CII Score: ${countryInfo.score}/100 (${countryInfo.level}), Trend: ${countryInfo.trend}`
              : undefined,
            headlines: relatedNews.map((n) => n.primaryTitle),
          }),
        });
        const data = await resp.json();
        setAnalysis(data.analysis);
      } catch {
        setAnalysis("Analysis unavailable.");
      } finally {
        setAnalyzing(false);
      }
    }

    const timer = setTimeout(analyze, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name, !!ciiData, !!newsData]);

  return (
    <div className="space-y-4">
      {countryInfo && (
        <Panel title="Instability Index" icon={<BarChart3 className="size-4" />}>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-4xl font-bold font-mono">{countryInfo.score}</span>
              <p className="text-xs text-text-muted mt-1">/100</p>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <ThreatBadge level={countryInfo.level} />
                <span className="text-sm text-text-secondary capitalize">{countryInfo.trend}</span>
                <span className="text-xs font-mono text-text-muted">
                  {countryInfo.change > 0 ? "+" : ""}
                  {countryInfo.change.toFixed(1)} (24h)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-wv-accent transition-all"
                  style={{ width: `${countryInfo.score}%` }}
                />
              </div>
              {countryInfo.newsMentions > 0 && (
                <p className="text-xs text-text-muted">{countryInfo.newsMentions} news mentions in current cycle</p>
              )}
            </div>
          </div>
        </Panel>
      )}

      <Panel title="Intelligence Brief" icon={<FileText className="size-4" />}>
        {analyzing ? (
          <PanelSkeleton rows={6} />
        ) : analysis ? (
          <div className="prose prose-sm prose-invert max-w-none text-text-secondary whitespace-pre-line leading-relaxed">
            {analysis}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No analysis available. Waiting for data...</p>
        )}
      </Panel>

      <Panel
        title="Related News"
        icon={<Newspaper className="size-4" />}
        timestamp={`${relatedNews.length} stories`}
        noPadding
      >
        {relatedNews.length === 0 ? (
          <div className="p-4 text-sm text-text-muted">No recent news found for {name}.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {relatedNews.slice(0, 10).map((n, i) => (
              <a
                key={i}
                href={n.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors"
              >
                {n.threat && <ThreatBadge level={n.threat.level as ThreatLevel} compact className="mt-0.5" />}
                <span className="text-sm text-text-primary line-clamp-2">{n.primaryTitle}</span>
              </a>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
