"use client";

import { useState, useRef, useEffect } from "react";
import { Panel } from "@/components/ui/panel";
import { Tv, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
    id: string;
    name: string;
    videoId: string;
}

// All fallback IDs taken directly from worldmonitor's LiveNewsPanel.ts
const CHANNELS: Channel[] = [
    { id: "bloomberg", name: "Bloomberg", videoId: "iEpJwprxDdk" },
    { id: "sky", name: "Sky News", videoId: "uvviIF4725I" },
    { id: "cnbc", name: "CNBC", videoId: "9NyxcX3rhQs" },
    { id: "cnn", name: "CNN", videoId: "w_Ma8oQLmSM" },
    { id: "fox", name: "Fox News", videoId: "QaftgYkG-ek" },
    { id: "bbc", name: "BBC News", videoId: "bjgQzJzCZKs" },
    { id: "france24", name: "France 24", videoId: "u9foWyMSETk" },
    { id: "dw", name: "DW News", videoId: "LuKwFajn37U" },
    { id: "euronews", name: "Euronews", videoId: "pykpO5kQJ98" },
    // Middle East — all confirmed from worldmonitor
    { id: "aljazeera", name: "Al Jazeera", videoId: "gCNeDWCI0vo" },
    { id: "alarabiya", name: "Al Arabiya", videoId: "n7eQejkXbnM" },
    { id: "trt-world", name: "TRT World", videoId: "ABfFhWzWs0s" },
    { id: "sky-ar", name: "Sky Arabia", videoId: "U--OjmpjF5o" },
    { id: "kan11", name: "Kan 11 IL", videoId: "TCnaIE_SAtM" },
    { id: "al-hadath", name: "Al Hadath", videoId: "xWXpl7azI8k" },
    { id: "asharq", name: "Asharq", videoId: "f6VpkfV7m4Y" },
    // Asia — confirmed
    { id: "cna", name: "CNA", videoId: "XWq5kBlakcQ" },
    { id: "nhk", name: "NHK World", videoId: "f0lYfG_vY_U" },
    { id: "india-today", name: "India Today", videoId: "sYZtOFzM78M" },
    { id: "tbs-news", name: "TBS News", videoId: "aUDm173E8k8" },
];

function buildEmbedUrl(videoId: string, muted: boolean): string {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&modestbranding=1&playsinline=1&rel=0`;
}

interface LiveTvPanelProps {
    onHeightMeasured?: (h: number) => void;
}

export function LiveTvPanel({ onHeightMeasured }: LiveTvPanelProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [muted, setMuted] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!onHeightMeasured) return;
        const el = panelRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            if (entry) onHeightMeasured(entry.contentRect.height);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [onHeightMeasured]);

    const active = CHANNELS[activeIdx]!;

    function selectChannel(idx: number) {
        setActiveIdx(idx);
        setIframeKey(k => k + 1);
    }

    function scrollChannels(dir: "left" | "right") {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -180 : 180, behavior: "smooth" });
    }

    return (
        <div ref={panelRef}>
            <Panel title="Live TV" icon={<Tv className="size-4" />} timestamp={active.name} noPadding>
                <div>
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50 bg-surface-1">
                        <button onClick={() => scrollChannels("left")} className="p-1 rounded text-text-muted hover:text-text-primary transition-colors shrink-0">
                            <ChevronLeft className="size-3.5" />
                        </button>
                        <div ref={scrollRef} className="flex gap-1 overflow-x-auto flex-1 scrollbar-none">
                            {CHANNELS.map((ch, idx) => (
                                <button
                                    key={ch.id}
                                    onClick={() => selectChannel(idx)}
                                    className={cn(
                                        "px-2.5 py-1 text-[11px] font-medium rounded whitespace-nowrap transition-colors shrink-0",
                                        idx === activeIdx
                                            ? "bg-wv-accent text-white"
                                            : "bg-surface-2 text-text-muted hover:text-text-primary hover:bg-surface-3"
                                    )}
                                >
                                    {ch.name}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => scrollChannels("right")} className="p-1 rounded text-text-muted hover:text-text-primary transition-colors shrink-0">
                            <ChevronRight className="size-3.5" />
                        </button>
                        <button
                            onClick={() => { setMuted(m => !m); setIframeKey(k => k + 1); }}
                            className="p-1.5 rounded text-text-muted hover:text-text-primary transition-colors shrink-0"
                            title={muted ? "Unmute" : "Mute"}
                        >
                            {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                        </button>
                    </div>
                    <div className="relative w-full bg-black overflow-hidden" style={{ paddingBottom: "56.25%" }}>
                        {isVisible ? (
                            <iframe
                                key={iframeKey}
                                src={buildEmbedUrl(active.videoId, muted)}
                                title={`${active.name} live`}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Tv className="size-8 text-text-muted animate-pulse" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-full pointer-events-none">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{active.name}</span>
                        </div>
                        {activeIdx > 0 && (
                            <button onClick={() => selectChannel(activeIdx - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full p-1.5 transition-colors">
                                <ChevronLeft className="size-4 text-white" />
                            </button>
                        )}
                        {activeIdx < CHANNELS.length - 1 && (
                            <button onClick={() => selectChannel(activeIdx + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 rounded-full p-1.5 transition-colors">
                                <ChevronRight className="size-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            </Panel>
        </div>
    );
}
