"use client";

import { useEffect, useState } from "react";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Sparkles } from "lucide-react";

interface BriefData {
  brief: string;
  generatedAt: string;
}

function formatBrief(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  const elements: React.ReactNode[] = [];

  let inBulletList = false;
  const bulletItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();

    if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
      if (!inBulletList) inBulletList = true;
      bulletItems.push(line.slice(2));
    } else {
      if (inBulletList && bulletItems.length > 0) {
        elements.push(
          <ul key={`list-${i}`} className="space-y-3 my-3">
            {bulletItems.map((item, j) => (
              <li key={j} className="flex gap-2 text-sm leading-relaxed">
                <span className="text-wv-accent mt-1 shrink-0">•</span>
                <span className="text-text-secondary">
                  {formatInlineText(item)}
                </span>
              </li>
            ))}
          </ul>
        );
        bulletItems.length = 0;
        inBulletList = false;
      }

      if (line.match(/^\[?(CRITICAL|HIGH|MEDIUM|LOW)\]?/i)) {
        elements.push(
          <p key={i} className="text-sm leading-relaxed text-text-secondary my-2">
            {formatInlineText(line)}
          </p>
        );
      } else {
        elements.push(
          <p key={i} className="text-sm leading-relaxed text-text-primary my-2">
            {formatInlineText(line)}
          </p>
        );
      }
    }
  }

  if (bulletItems.length > 0) {
    elements.push(
      <ul key="list-end" className="space-y-3 my-3">
        {bulletItems.map((item, j) => (
          <li key={j} className="flex gap-2 text-sm leading-relaxed">
            <span className="text-wv-accent mt-1 shrink-0">•</span>
            <span className="text-text-secondary">{formatInlineText(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return elements;
}

function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[(?:CRITICAL|HIGH|MEDIUM|LOW)\])/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part === "[CRITICAL]") return <span key={i} className="font-mono text-[11px] font-semibold text-threat-critical">{part}</span>;
    if (part === "[HIGH]") return <span key={i} className="font-mono text-[11px] font-semibold text-threat-high">{part}</span>;
    if (part === "[MEDIUM]") return <span key={i} className="font-mono text-[11px] font-semibold text-threat-medium">{part}</span>;
    if (part === "[LOW]") return <span key={i} className="font-mono text-[11px] font-semibold text-threat-low">{part}</span>;
    return part;
  });
}

export function AIBriefPanel() {
  const [data, setData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrief() {
      try {
        const newsResp = await fetch("/api/news/feeds");
        const newsData = await newsResp.json();
        const headlines = (newsData.clusters || [])
          .slice(0, 30)
          .map((c: { primaryTitle: string }) => c.primaryTitle);

        if (headlines.length === 0) {
          setError("No news data available");
          setLoading(false);
          return;
        }

        const briefResp = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ headlines }),
        });

        if (!briefResp.ok) {
          setError("AI brief unavailable — check GROQ_API_KEY");
          setLoading(false);
          return;
        }

        const briefData = await briefResp.json();
        setData(briefData);
      } catch {
        setError("Failed to load AI brief");
      } finally {
        setLoading(false);
      }
    }

    loadBrief();
  }, []);

  const timestamp = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : undefined;

  return (
    <Panel
      title="AI Intelligence Brief"
      icon={<Sparkles className="size-4 text-wv-accent" />}
      timestamp={timestamp}
      className="border-wv-accent/20"
    >
      {loading ? (
        <PanelSkeleton rows={6} />
      ) : error ? (
        <div className="text-sm text-muted-foreground py-4">
          <p>{error}</p>
          <p className="text-xs mt-2 text-text-muted">The AI brief requires a GROQ_API_KEY. Headlines are still available in the News panel.</p>
        </div>
      ) : data?.brief ? (
        <div>{formatBrief(data.brief)}</div>
      ) : (
        <p className="text-sm text-muted-foreground">No brief available</p>
      )}
    </Panel>
  );
}
