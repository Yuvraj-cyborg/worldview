"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntelScene {
    title: string;
    threat: string;
    summary: string;
}
interface IntelBrief {
    scenes: IntelScene[];
    generatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());
const CRITICAL = new Set(["↑", "⚠"]);
const SEEN_KEY = "gt:seen-brief-ts";

export function NotificationBell() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [unread, setUnread] = useState(0);
    const [shaking, setShaking] = useState(false);

    // Sync permission state on mount
    useEffect(() => {
        if ("Notification" in window) setPermission(Notification.permission);
    }, []);

    const { data } = useSWR<IntelBrief>("/api/ai/intel-brief", fetcher, {
        refreshInterval: 300_000,
        revalidateOnFocus: false,
    });

    // Count new critical scenes since last seen timestamp
    useEffect(() => {
        if (!data?.scenes) return;
        const lastSeen = localStorage.getItem(SEEN_KEY) ?? "";
        if (data.generatedAt === lastSeen) return; // same batch, no new alerts

        const critical = data.scenes.filter(s => CRITICAL.has(s.threat));
        if (critical.length > 0) {
            setUnread(critical.length);
            setShaking(true);
            setTimeout(() => setShaking(false), 1000);
        }
    }, [data]);

    function handleClick() {
        if (!("Notification" in window)) return;

        if (Notification.permission === "default") {
            // First click: ask for permission
            Notification.requestPermission().then(p => {
                setPermission(p);
                if (p === "granted") triggerTestNotification();
            });
            return;
        }

        if (Notification.permission === "denied") return; // nothing we can do

        // Already granted: clicking bell dismisses the badge and fires a summary notification
        if (data?.scenes) {
            const critical = data.scenes.filter(s => CRITICAL.has(s.threat));
            if (critical.length > 0) {
                const top = critical[0]!;
                new Notification(`⚠ GeoTrack: ${top.title}`, {
                    body: `${critical.length} critical alert${critical.length > 1 ? "s" : ""}. Latest: ${top.summary?.slice(0, 120)}`,
                    icon: "/favicon.ico",
                    tag: "bell-summary",
                });
            }
        }
        // Mark as seen
        if (data?.generatedAt) localStorage.setItem(SEEN_KEY, data.generatedAt);
        setPermission(Notification.permission);
        setUnread(0);
    }

    function triggerTestNotification() {
        new Notification("✅ GeoTrack Alerts Enabled", {
            body: "You'll be notified when critical events are detected by AI analysis.",
            icon: "/favicon.ico",
            tag: "test-notification",
        });
    }

    const denied = permission === "denied";

    return (
        <button
            onClick={handleClick}
            title={
                denied
                    ? "Notifications blocked — enable in browser settings"
                    : permission === "default"
                        ? "Click to enable notifications"
                        : unread > 0
                            ? `${unread} new critical alert${unread > 1 ? "s" : ""}`
                            : "Notifications active — no new alerts"
            }
            className={cn(
                "relative size-8 cursor-pointer flex items-center justify-center rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                shaking && "animate-[wiggle_0.4s_ease-in-out_2]",
                denied && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Notifications"
        >
            {denied ? (
                <BellOff className="size-4" />
            ) : (
                <Bell className={cn("size-4", permission === "granted" && unread === 0 && "text-green-500/70")} />
            )}

            {/* Badge */}
            {unread > 0 && permission === "granted" && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-full bg-threat-critical text-[9px] font-bold text-white flex items-center justify-center px-0.5 animate-pulse">
                    {unread}
                </span>
            )}

            {/* Dot: permission not yet asked */}
            {permission === "default" && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-yellow-400" />
            )}
        </button>
    );
}
