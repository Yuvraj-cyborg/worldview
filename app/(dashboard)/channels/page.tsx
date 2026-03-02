import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Live News Channels — GeoTrack",
    description: "Watch live news channels from around the world.",
};

const NEWS_CHANNELS = [
    // ── Tier 1 — Major International ──────────────────────────────────
    { name: "Al Jazeera English", youtubeId: "jL8uDJJBjMA", region: "Middle East", language: "English" },
    { name: "France 24 English", youtubeId: "Ap-UM1O9RBk", region: "Europe", language: "English" },
    { name: "DW News", youtubeId: "cFdgjYoBMIg", region: "Europe", language: "English" },
    { name: "Sky News", youtubeId: "siyW0GOBtUo", region: "Europe", language: "English" },
    { name: "NBC News NOW", youtubeId: "MZLO5fBoKn8", region: "Americas", language: "English" },
    { name: "ABC News Live", youtubeId: "w_Ma8oQLmSM", region: "Americas", language: "English" },
    { name: "euronews", youtubeId: "pykpO5kQJ98", region: "Europe", language: "English" },
    { name: "WION", youtubeId: "UGXoMc9VeeA", region: "Asia", language: "English" },
    { name: "CNA 24/7", youtubeId: "XWq5kBlakcQ", region: "Asia", language: "English" },
    { name: "TRT World", youtubeId: "CV5Fooi8YJI", region: "Middle East", language: "English" },
    // ── Tier 2 — Regional ──────────────────────────────────────────────
    { name: "NHK World", youtubeId: "f0lYkdA-Mx0", region: "Asia", language: "English" },
    { name: "NDTV 24x7", youtubeId: "WB0nSEw3Ixw", region: "Asia", language: "English" },
    { name: "France 24 Français", youtubeId: "l8PMl7tUDIE", region: "Europe", language: "French" },
    { name: "Al Jazeera Arabic", youtubeId: "bNyUyrR0PHo", region: "Middle East", language: "Arabic" },
    { name: "RT News", youtubeId: "V0I5eglJMRI", region: "Europe", language: "English" },
    { name: "Arirang TV", youtubeId: "S-jJEYgLVBk", region: "Asia", language: "English" },
];

const REGIONS = ["All", "Americas", "Europe", "Asia", "Middle East"];

export default function NewsChannelsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                    Live News Channels
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    24/7 live broadcasts from major international news networks
                </p>
            </div>

            {/* Channel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {NEWS_CHANNELS.map((channel) => (
                    <div
                        key={channel.youtubeId}
                        className="relative overflow-hidden rounded-xl bg-surface-1/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:bg-surface-2/80 hover:border-white/[0.1]"
                    >
                        {/* Video */}
                        <div className="relative aspect-video bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0`}
                                title={channel.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                                loading="lazy"
                            />
                            {/* Live indicator */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 px-2 py-0.5 rounded-full">
                                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        {/* Info */}
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-text-primary">{channel.name}</h3>
                                <span className="text-[10px] font-medium text-text-muted bg-muted px-1.5 py-0.5 rounded uppercase">
                                    {channel.language}
                                </span>
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5">{channel.region}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
