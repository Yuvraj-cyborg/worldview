"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Brain, Eye, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/format";

interface IntelScene {
    title: string;
    summary: string;
    sources: string[];
    differences: string;
    threat: string;
}

interface IntelBrief {
    scenes: IntelScene[];
    underreported: string[];
    generatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const THREAT_STYLES: Record<string, string> = {
    "↑": "text-threat-high bg-threat-high/10",
    "⚠": "text-threat-critical bg-threat-critical/10",
    "↓": "text-positive bg-positive/10",
    "→": "text-text-muted bg-muted",
};

export function IntelBriefPanel({ maxHeight }: { maxHeight?: number }) {
    const { data, isLoading, error } = useSWR<IntelBrief>(
        "/api/ai/intel-brief",
        fetcher,
        { refreshInterval: 300_000 }
    );

    const scenes = data?.scenes ?? [];
    const underreported = data?.underreported ?? [];

    return (
        <Panel
            title="AI Intel Brief"
            icon={<Brain className="size-4" />}
            timestamp={
                data?.generatedAt
                    ? `Updated ${timeAgo(new Date(data.generatedAt))}`
                    : undefined
            }
            noPadding
            contentClassName="max-h-none"
            contentStyle={maxHeight ? { maxHeight: `${maxHeight}px`, overflowY: "auto" } : undefined}
        >
            {isLoading ? (
                <div className="p-4"><PanelSkeleton rows={6} /></div>
            ) : error || scenes.length === 0 ? (
                <div className="p-4 text-sm text-text-muted">
                    {error ? "Intel brief unavailable. Check Groq API key." : "Analyzing news feeds..."}
                </div>
            ) : (
                <div>
                    <div className="divide-y divide-border/50">
                        {scenes.map((scene, i) => (
                            <div key={i} className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={cn(
                                            "text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0",
                                            THREAT_STYLES[scene.threat] ?? THREAT_STYLES["→"]
                                        )}
                                    >
                                        {scene.threat}
                                    </span>
                                    <span className="text-[13px] font-semibold text-text-primary leading-snug">
                                        {scene.title}
                                    </span>
                                </div>
                                <p className="text-[12px] text-text-secondary leading-relaxed mt-1">
                                    {scene.summary}
                                </p>
                                {scene.differences && scene.differences !== "Sources aligned" && (
                                    <p className="text-[11px] text-wv-accent mt-1.5 flex items-start gap-1">
                                        <ArrowUpRight className="size-3 shrink-0 mt-0.5" />
                                        <span>{scene.differences}</span>
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {(scene.sources ?? []).slice(0, 4).map((src) => (
                                        <span
                                            key={src}
                                            className="text-[9px] font-medium text-text-muted bg-muted px-1.5 py-0.5 rounded"
                                        >
                                            {src}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {underreported.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Eye className="size-3 text-text-muted" />
                                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                                    Underreported
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {underreported.map((u, i) => (
                                    <li key={i} className="text-[11px] text-text-secondary leading-snug">
                                        • {u}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Panel>
    );
}
