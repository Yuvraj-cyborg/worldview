"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Bell, X, AlertTriangle, TrendingUp, Minus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/format";

interface IntelScene {
    title: string;
    threat: string;
    summary: string;
    sources: string[];
    differences?: string;
}
interface IntelBrief {
    scenes: IntelScene[];
    generatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());
const CRITICAL = new Set(["↑", "⚠"]);
const SEEN_KEY = "gt:seen-brief-ts";

const THREAT_ICON: Record<string, React.ReactNode> = {
    "↑": <TrendingUp className="size-3.5 text-orange-400" />,
    "⚠": <AlertTriangle className="size-3.5 text-red-400" />,
    "↓": <Minus className="size-3.5 text-green-400" />,
    "→": <Shield className="size-3.5 text-slate-400" />,
};

const THREAT_BORDER: Record<string, string> = {
    "↑": "border-l-orange-400",
    "⚠": "border-l-red-400",
    "↓": "border-l-green-400",
    "→": "border-l-slate-500",
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useSWR<IntelBrief>("/api/ai/intel-brief", fetcher, {
        refreshInterval: 300_000,
        revalidateOnFocus: false,
    });

    // Count unseen critical alerts
    useEffect(() => {
        if (!data?.scenes) return;
        const lastSeen = localStorage.getItem(SEEN_KEY) ?? "";
        if (data.generatedAt === lastSeen) return;
        const count = data.scenes.filter(s => CRITICAL.has(s.threat)).length;
        if (count > 0) setUnread(count);
    }, [data]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    function toggle() {
        setOpen(o => !o);
        if (!open && data?.generatedAt) {
            localStorage.setItem(SEEN_KEY, data.generatedAt);
            setUnread(0);
        }
    }

    const criticalScenes = data?.scenes.filter(s => CRITICAL.has(s.threat)) ?? [];
    const otherScenes = data?.scenes.filter(s => !CRITICAL.has(s.threat)) ?? [];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button — always blue */}
            <button
                onClick={toggle}
                className="relative size-8 cursor-pointer flex items-center justify-center rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                aria-label="Alerts"
            >
                <Bell className={cn("size-4", unread > 0 && "animate-[wiggle_0.5s_ease-in-out_2]")} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                        {unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-10 w-80 z-50 rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-1">
                        <div className="flex items-center gap-2">
                            <Bell className="size-3.5 text-blue-400" />
                            <span className="text-[12px] font-semibold uppercase tracking-wide text-text-primary">AI Alerts</span>
                            {data?.generatedAt && (
                                <span className="text-[10px] text-text-muted font-mono">
                                    {timeAgo(new Date(data.generatedAt))}
                                </span>
                            )}
                        </div>
                        <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                            <X className="size-3.5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="px-4 py-6 text-center text-[12px] text-text-muted">
                                <div className="size-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                Analyzing with Groq...
                            </div>
                        ) : criticalScenes.length === 0 && otherScenes.length === 0 ? (
                            <div className="px-4 py-6 text-center text-[12px] text-text-muted">
                                No active alerts
                            </div>
                        ) : (
                            <>
                                {criticalScenes.length > 0 && (
                                    <div>
                                        <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-400 bg-red-500/5 border-b border-border">
                                            Critical
                                        </div>
                                        {criticalScenes.map((scene, i) => (
                                            <div key={i} className={cn("border-l-2 px-4 py-3 border-b border-border/50 last:border-b-0", THREAT_BORDER[scene.threat])}>
                                                <div className="flex items-start gap-2">
                                                    {THREAT_ICON[scene.threat]}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-semibold text-text-primary leading-snug">{scene.title}</p>
                                                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed line-clamp-3">{scene.summary}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {(scene.sources ?? []).slice(0, 3).map(src => (
                                                                <span key={src} className="text-[9px] text-text-muted bg-muted px-1.5 py-0.5 rounded">{src}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {otherScenes.length > 0 && (
                                    <div>
                                        <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted bg-surface-1 border-b border-border">
                                            Developing
                                        </div>
                                        {otherScenes.map((scene, i) => (
                                            <div key={i} className={cn("border-l-2 px-4 py-3 border-b border-border/50 last:border-b-0", THREAT_BORDER[scene.threat] ?? "border-l-slate-600")}>
                                                <div className="flex items-start gap-2">
                                                    {THREAT_ICON[scene.threat] ?? THREAT_ICON["→"]}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-semibold text-text-primary leading-snug">{scene.title}</p>
                                                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed line-clamp-2">{scene.summary}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-border bg-surface-1 text-[10px] text-text-muted flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                        Powered by Groq · refreshes every 5 min
                    </div>
                </div>
            )}
        </div>
    );
}
