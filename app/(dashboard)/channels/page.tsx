import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Live News Channels — GeoTrack",
    description: "Watch live news channels from around the world.",
};

const NEWS_CHANNELS = [
    // ── Priority: Iran, USA, Israel, UK ────────────────────────────────
    { name: "Al Jazeera English", youtubeId: "jL8uDJJBjMA", region: "Middle East", language: "EN" },
    { name: "Sky News", youtubeId: "9Auq9mYxFEE", region: "UK", language: "EN" },
    { name: "NBC News NOW", youtubeId: "MZLO5fBoKn8", region: "USA", language: "EN" },
    { name: "ABC News Live", youtubeId: "w_Ma8oQLmSM", region: "USA", language: "EN" },
    { name: "i24NEWS English", youtubeId: "vDg8QT5lJCA", region: "Israel", language: "EN" },
    { name: "TRT World", youtubeId: "CV5Fooi8YJI", region: "Middle East", language: "EN" },
    { name: "France 24 English", youtubeId: "Ap-UM1O9RBk", region: "Europe", language: "EN" },
    { name: "DW News", youtubeId: "cFdgjYoBMIg", region: "Europe", language: "EN" },
    { name: "WION", youtubeId: "UGXoMc9VeeA", region: "Asia", language: "EN" },
    { name: "euronews", youtubeId: "pykpO5kQJ98", region: "Europe", language: "EN" },
    { name: "CNA 24/7", youtubeId: "XWq5kBlakcQ", region: "Asia", language: "EN" },
    { name: "NDTV 24x7", youtubeId: "WB0nSEw3Ixw", region: "Asia", language: "EN" },
    { name: "NHK World", youtubeId: "f0lYkdA-Mx0", region: "Asia", language: "EN" },
    { name: "Al Jazeera Arabic", youtubeId: "bNyUyrR0PHo", region: "Middle East", language: "AR" },
];

export default function NewsChannelsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                    Live News Channels
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    24/7 live broadcasts — Iran, USA, Israel, UK and international
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {NEWS_CHANNELS.map((channel) => (
                    <div
                        key={channel.youtubeId}
                        className="relative overflow-hidden rounded-xl bg-surface-1/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:bg-surface-2/80 hover:border-white/[0.1]"
                    >
                        <div className="relative aspect-video bg-black">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${channel.youtubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                                title={channel.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                                loading="lazy"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 px-2 py-0.5 rounded-full">
                                <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        <div className="px-4 py-2.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-text-primary">{channel.name}</h3>
                                <span className="text-[10px] font-medium text-text-muted bg-muted px-1.5 py-0.5 rounded">
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
