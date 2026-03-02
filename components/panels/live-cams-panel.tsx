"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Panel } from "@/components/ui/panel";
import { Camera, Grid2x2, Monitor, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WebcamRegion = "iran" | "middle-east" | "europe" | "asia" | "americas";

interface WebcamFeed {
    id: string;
    city: string;
    country: string;
    region: WebcamRegion;
    fallbackVideoId: string;
}

// Verified YouTube live stream IDs — geopolitically focused
const WEBCAM_FEEDS: WebcamFeed[] = [
    // ── Iran / Middle East Hotspot ─────────────────────────────────────
    { id: "tehran", city: "Tehran", country: "Iran", region: "iran", fallbackVideoId: "-zGuR1qVKrU" },
    { id: "tel-aviv", city: "Tel Aviv", country: "Israel", region: "iran", fallbackVideoId: "gmtlJ_m2r5A" },
    { id: "jerusalem", city: "Jerusalem", country: "Israel", region: "iran", fallbackVideoId: "JHwwZRH2wz8" },
    { id: "iran-multicam", city: "Middle East Multi", country: "Multi", region: "iran", fallbackVideoId: "4E-iFtUM2kk" },
    // ── Middle East — Strategic ────────────────────────────────────────
    { id: "mecca", city: "Mecca", country: "Saudi Arabia", region: "middle-east", fallbackVideoId: "DEcpmPUbkDQ" },
    { id: "dubai", city: "Dubai", country: "UAE", region: "middle-east", fallbackVideoId: "QDlNYciP_uo" },
    { id: "jerusalem-wall", city: "Western Wall", country: "Israel", region: "middle-east", fallbackVideoId: "UyduhBUpO7Q" },
    { id: "tehran-2", city: "Tehran", country: "Iran", region: "middle-east", fallbackVideoId: "-zGuR1qVKrU" },
    // ── Europe — Conflict Zones ────────────────────────────────────────
    { id: "kyiv", city: "Kyiv", country: "Ukraine", region: "europe", fallbackVideoId: "-Q7FuPINDjA" },
    { id: "odessa", city: "Odessa", country: "Ukraine", region: "europe", fallbackVideoId: "e2gC37ILQmk" },
    { id: "london", city: "London", country: "UK", region: "europe", fallbackVideoId: "Lxqcg1qt0XU" },
    { id: "paris", city: "Paris", country: "France", region: "europe", fallbackVideoId: "OzYp4NRZlwQ" },
    { id: "st-petersburg", city: "St. Petersburg", country: "Russia", region: "europe", fallbackVideoId: "CjtIYbmVfck" },
    { id: "istanbul", city: "Istanbul", country: "Turkey", region: "europe", fallbackVideoId: "s-4IjEA3qkM" },
    // ── Americas ───────────────────────────────────────────────────────
    { id: "washington", city: "Washington DC", country: "USA", region: "americas", fallbackVideoId: "1wV9lLe14aU" },
    { id: "new-york", city: "New York", country: "USA", region: "americas", fallbackVideoId: "4qyZLflp-sI" },
    // ── Asia-Pacific ───────────────────────────────────────────────────
    { id: "taipei", city: "Taipei", country: "Taiwan", region: "asia", fallbackVideoId: "z_fY1pj1VBw" },
    { id: "tokyo", city: "Tokyo", country: "Japan", region: "asia", fallbackVideoId: "4pu9sF5Qssw" },
    { id: "seoul", city: "Seoul", country: "South Korea", region: "asia", fallbackVideoId: "-JhoMGoAfFc" },
    { id: "shanghai", city: "Shanghai", country: "China", region: "asia", fallbackVideoId: "76EwqI5XZIc" },
];

const REGIONS: { key: "all" | WebcamRegion; label: string }[] = [
    { key: "iran", label: "🇮🇷 Iran" },
    { key: "all", label: "All" },
    { key: "middle-east", label: "Middle East" },
    { key: "europe", label: "Europe" },
    { key: "americas", label: "Americas" },
    { key: "asia", label: "Asia-Pacific" },
];

const DEFAULT_GRID_IDS = ["jerusalem", "tehran", "kyiv", "washington"];

type ViewMode = "grid" | "single";

function buildEmbedUrl(videoId: string): string {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`;
}

export function LiveCamsPanel() {
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [region, setRegion] = useState<"all" | WebcamRegion>("iran");
    const [activeFeed, setActiveFeed] = useState<WebcamFeed>(WEBCAM_FEEDS[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Intersection Observer — only render iframes when visible
    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const filtered = region === "all"
        ? WEBCAM_FEEDS
        : WEBCAM_FEEDS.filter((f) => f.region === region);

    const gridFeeds = region === "all"
        ? DEFAULT_GRID_IDS.map((id) => WEBCAM_FEEDS.find((f) => f.id === id)!).filter(Boolean)
        : filtered.slice(0, 4);

    const handleRegion = useCallback((key: "all" | WebcamRegion) => {
        setRegion(key);
        const feeds = key === "all" ? WEBCAM_FEEDS : WEBCAM_FEEDS.filter((f) => f.region === key);
        if (feeds.length > 0 && !feeds.find((f) => f.id === activeFeed.id)) {
            setActiveFeed(feeds[0]);
        }
    }, [activeFeed.id]);

    return (
        <Panel
            title="Live Cameras"
            icon={<Camera className="size-4" />}
            timestamp={`${filtered.length} feeds`}
            noPadding
        >
            <div ref={panelRef} className={cn(isFullscreen && "fixed inset-0 z-50 bg-background")}>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 gap-2 overflow-x-auto">
                    {/* Region buttons */}
                    <div className="flex gap-1">
                        {REGIONS.map((r) => (
                            <button
                                key={r.key}
                                onClick={() => handleRegion(r.key)}
                                className={cn(
                                    "px-2 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors",
                                    region === r.key
                                        ? "bg-wv-accent text-white"
                                        : "text-text-muted hover:text-text-primary bg-surface-1 hover:bg-surface-2"
                                )}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    {/* View mode + fullscreen */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                viewMode === "grid" ? "text-wv-accent bg-wv-accent/10" : "text-text-muted hover:text-text-primary"
                            )}
                            title="Grid view"
                        >
                            <Grid2x2 className="size-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode("single")}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                viewMode === "single" ? "text-wv-accent bg-wv-accent/10" : "text-text-muted hover:text-text-primary"
                            )}
                            title="Single view"
                        >
                            <Monitor className="size-3.5" />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-1.5 rounded text-text-muted hover:text-text-primary transition-colors"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === "grid" ? (
                    <div className={cn("grid grid-cols-2 gap-px bg-border/30", isFullscreen && "h-[calc(100vh-92px)]")}>
                        {gridFeeds.map((feed) => (
                            <div
                                key={feed.id}
                                className="relative bg-black cursor-pointer group"
                                onClick={() => { setActiveFeed(feed); setViewMode("single"); }}
                            >
                                <div className={cn("w-full", isFullscreen ? "h-full" : "aspect-video")}>
                                    {isVisible ? (
                                        <iframe
                                            src={buildEmbedUrl(feed.fallbackVideoId)}
                                            title={`${feed.city} live webcam`}
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            className="w-full h-full pointer-events-none"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-surface-1 flex items-center justify-center">
                                            <Camera className="size-6 text-text-muted animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                {/* Label overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                                            {feed.city}
                                        </span>
                                    </div>
                                </div>
                                {/* Hover expand indicator */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="size-5 text-white/60" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {/* Single view player */}
                        <div className={cn("relative bg-black", isFullscreen ? "h-[calc(100vh-140px)]" : "aspect-video")}>
                            {isVisible ? (
                                <iframe
                                    src={buildEmbedUrl(activeFeed.fallbackVideoId)}
                                    title={`${activeFeed.city} live webcam`}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-surface-1 flex items-center justify-center">
                                    <Camera className="size-8 text-text-muted animate-pulse" />
                                </div>
                            )}
                            {/* Label */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-full">
                                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                                    {activeFeed.city}, {activeFeed.country}
                                </span>
                            </div>
                        </div>

                        {/* Feed switcher */}
                        <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-border/50 overflow-x-auto">
                            <button
                                onClick={() => setViewMode("grid")}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                <Grid2x2 className="size-3" /> Grid
                            </button>
                            {filtered.map((feed) => (
                                <button
                                    key={feed.id}
                                    onClick={() => setActiveFeed(feed)}
                                    className={cn(
                                        "px-2 py-1 text-[10px] font-medium rounded transition-colors whitespace-nowrap",
                                        feed.id === activeFeed.id
                                            ? "bg-wv-accent text-white"
                                            : "bg-surface-1 text-text-muted hover:text-text-primary hover:bg-surface-2"
                                    )}
                                >
                                    {feed.city}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
