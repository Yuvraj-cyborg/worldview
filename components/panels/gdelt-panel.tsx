"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Globe, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/format";

interface GdeltArticle {
  title?: string | Record<string, unknown>;
  url?: string | Record<string, unknown>;
  domain?: string | Record<string, unknown>;
  seenDate?: string;
  sourcecountry?: string | Record<string, unknown>;
  tone?: number;
}

function safeStr(v: string | Record<string, unknown> | undefined): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "#text" in v) return String((v as { "#text"?: unknown })["#text"] ?? "");
  if (v && typeof v === "object" && "@_url" in v) return String((v as { "@_url"?: unknown })["@_url"] ?? "");
  return "";
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TOPICS = [
  { id: "conflict", label: "Conflict" },
  { id: "protest", label: "Protests" },
  { id: "military", label: "Military" },
  { id: "terrorism", label: "Terrorism" },
  { id: "diplomacy", label: "Diplomacy" },
];

export function GdeltPanel() {
  const [topic, setTopic] = useState("conflict");
  const { data, isLoading, error } = useSWR<{ articles: GdeltArticle[]; count: number; source?: string }>(
    `/api/geo/gdelt?topic=${topic}`,
    fetcher,
    { refreshInterval: 900_000 }
  );

  const articles = data?.articles ?? [];
  const source = data?.source ?? "GDELT";

  return (
    <Panel
      title="Live Intelligence"
      icon={<Globe className="size-4" />}
      timestamp={data ? `${data.count} articles · ${source}` : undefined}
      noPadding
    >
      <div className="flex gap-1 px-3 pt-3 pb-2 overflow-x-auto">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(t.id)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors",
              topic === t.id
                ? "bg-wv-accent text-white"
                : "text-text-muted hover:text-text-primary bg-surface-1 hover:bg-surface-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={8} /></div>
      ) : error || articles.length === 0 ? (
        <div className="p-4">
          <p className="text-sm text-text-muted">
            {error ? "GDELT API temporarily unavailable." : "No articles for this topic."}
          </p>
          <p className="text-[11px] text-text-muted mt-1">
            GDELT may be slow from some regions. Data loads in background.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
          {articles.slice(0, 30).map((a, i) => {
            const tone = a.tone ?? 0;
            const toneColor = tone < -3 ? "text-negative" : tone > 3 ? "text-positive" : "text-text-muted";
            return (
              <a
                key={i}
                href={safeStr(a.url) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug line-clamp-2 group-hover:text-wv-accent transition-colors">
                    {safeStr(a.title) || "Untitled"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                    <span className="font-medium">{safeStr(a.domain)}</span>
                    {safeStr(a.sourcecountry) && (
                      <>
                        <span>·</span>
                        <span>{safeStr(a.sourcecountry)}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className={cn("font-mono", toneColor)}>
                      {tone > 0 ? "+" : ""}{tone.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{timeAgo(new Date(a.seenDate ?? Date.now()))}</span>
                  </div>
                </div>
                <ExternalLink className="size-3 shrink-0 mt-1 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
