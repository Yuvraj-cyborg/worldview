import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Live News Channels — GeoTrack",
    description: "Watch live news channels from around the world.",
};

// YouTube supports embedding live streams via channel ID:
// https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID
// This auto-resolves to the current live stream — no stale video IDs!
const NEWS_CHANNELS = [
    // ── Priority: Iran, Israel, USA, UK ────────────────────────────────
    { name: "Al Jazeera English", channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg", region: "Middle East" },
    { name: "Sky News", channelId: "UCoMdktPbSTixAyNGwb-UYkQ", region: "UK" },
    { name: "France 24 English", channelId: "UCQfwfsi5VrQ8yKZ-UWmAEFg", region: "Europe" },
    { name: "DW News", channelId: "UCknLrEdhRCp1aegoMqRaCZg", region: "Europe" },
    { name: "NBC News", channelId: "UCeY0bbntWzzVIaj2z3QigXg", region: "USA" },
    { name: "ABC News", channelId: "UCBi2mrWuNuyYy4gbM6fU18Q", region: "USA" },
    { name: "WION", channelId: "UC_gUM8rL-Lrg6O3adPW9K1g", region: "Asia" },
    { name: "TRT World", channelId: "UC7fWeaHhqgM4Lba0UxnUKyg", region: "Middle East" },
    { name: "euronews", channelId: "UCW2QcKZiU8aUGg4yxCIditg", region: "Europe" },
    { name: "NDTV 24x7", channelId: "UCL1bVFnMbdSVI9O0lOmGQaw", region: "India" },
    { name: "CNA", channelId: "UCo8bcnLyZH8tBIH9V1mLgqQ", region: "Asia" },
    { name: "NHK World", channelId: "UCX-oy7C30jR1MxqOoMOoBhQ", region: "Japan" },
    { name: "UNITED24 (Ukraine)", channelId: "UCrMr21fU0weMz5hj06bAlYQ", region: "Ukraine" },
    { name: "i24NEWS English", channelId: "UCKunLJJyMRFfzImkf5BSMIA", region: "Israel" },
];

export default function NewsChannelsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                    Live News Channels
                </h1>
                <p className="text-sm text-text-muted mt-1">
                    24/7 live broadcasts — always up-to-date via channel auto-detection
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {NEWS_CHANNELS.map((channel) => (
                    <div
                        key={channel.channelId}
                        className="relative overflow-hidden rounded-xl bg-surface-1/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:bg-surface-2/80 hover:border-white/[0.1]"
                    >
                        <div className="relative aspect-video bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/live_stream?channel=${channel.channelId}&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
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
                                    {channel.region}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
