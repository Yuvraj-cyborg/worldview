"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";

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

const NOTIFIED_KEY = "gt:notified-scenes";
const CRITICAL_THREATS = new Set(["↑", "⚠"]);

function getNotifiedIds(): Set<string> {
    try {
        const raw = localStorage.getItem(NOTIFIED_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set();
    }
}

function addNotifiedId(id: string) {
    try {
        const set = getNotifiedIds();
        set.add(id);
        // Keep only last 50
        const arr = Array.from(set).slice(-50);
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
    } catch { /* ignore */ }
}

export function useIntelNotifications() {
    const permissionRef = useRef<NotificationPermission>("default");

    // Request permission once on mount
    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        if (Notification.permission === "default") {
            Notification.requestPermission().then(p => {
                permissionRef.current = p;
            });
        } else {
            permissionRef.current = Notification.permission;
        }
    }, []);

    const { data } = useSWR<IntelBrief>("/api/ai/intel-brief", fetcher, {
        refreshInterval: 300_000, // 5 min
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (!data?.scenes || typeof window === "undefined" || !("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        const notified = getNotifiedIds();

        for (const scene of data.scenes) {
            if (!CRITICAL_THREATS.has(scene.threat)) continue;
            // Use title + generatedAt as stable ID
            const id = `${scene.title}::${data.generatedAt}`;
            if (notified.has(id)) continue;

            try {
                const n = new Notification(`⚠ GeoTrack Alert: ${scene.title}`, {
                    body: scene.summary?.slice(0, 150) ?? "",
                    icon: "/favicon.ico",
                    tag: id, // deduplicate at browser level too
                    requireInteraction: false,
                });
                n.onclick = () => {
                    window.focus();
                    n.close();
                };
                addNotifiedId(id);
            } catch { /* ignore */ }
        }
    }, [data]);
}
