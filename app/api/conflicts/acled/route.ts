import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache/redis";

export const dynamic = "force-dynamic";

const ACLED_API_URL = "https://acleddata.com/api/acled/read";
const CACHE_KEY = "gt:conflicts:acled";
const CACHE_TTL = 3600; // 1 hour — ACLED updates periodically

interface ACLEDEvent {
    event_id_cnty: string;
    event_date: string;
    year: number;
    disorder_type: string;
    event_type: string;
    sub_event_type: string;
    actor1: string;
    actor2: string;
    interaction: string;
    country: string;
    admin1: string;
    location: string;
    latitude: string;
    longitude: string;
    source: string;
    notes: string;
    fatalities: number;
    region: string;
}

interface ACLEDResponse {
    status: number;
    success: boolean;
    count: number;
    total_count: number;
    data: ACLEDEvent[];
}

function getDateRange(): { from: string; to: string } {
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    return { from, to };
}

async function fetchACLED(): Promise<{
    events: Array<{
        id: string;
        date: string;
        type: string;
        subType: string;
        actor1: string;
        actor2: string;
        country: string;
        region: string;
        admin1: string;
        location: string;
        lat: number;
        lon: number;
        fatalities: number;
        notes: string;
        source: string;
    }>;
    totalCount: number;
} | null> {
    const token = process.env.ACLED_ACCESS_TOKEN;
    if (!token) return null;

    const { from, to } = getDateRange();

    // Fetch battles, explosions/remote violence, and violence against civilians
    const eventTypes = [
        "Battles",
        "Explosions/Remote violence",
        "Violence against civilians",
    ];
    const eventTypeParam = eventTypes.join("|");

    const params = new URLSearchParams({
        limit: "300",
        _format: "json",
        event_date: `${from}|${to}`,
        event_date_where: "BETWEEN",
        event_type: eventTypeParam,
    });

    const url = `${ACLED_API_URL}?${params.toString()}`;

    const resp = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "GeoTrack/1.0",
        },
        signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
        console.error(`[acled] API returned ${resp.status}: ${resp.statusText}`);
        return null;
    }

    const data: ACLEDResponse = await resp.json();

    if (!data.success || !data.data) return null;

    const events = data.data.map((e) => ({
        id: e.event_id_cnty,
        date: e.event_date,
        type: e.event_type,
        subType: e.sub_event_type,
        actor1: e.actor1,
        actor2: e.actor2,
        country: e.country,
        region: e.region,
        admin1: e.admin1,
        location: e.location,
        lat: parseFloat(e.latitude),
        lon: parseFloat(e.longitude),
        fatalities: e.fatalities,
        notes: e.notes,
        source: e.source,
    }));

    return { events, totalCount: data.total_count };
}

export async function GET() {
    try {
        type ACLEDData = {
            events: Array<{
                id: string;
                date: string;
                type: string;
                subType: string;
                actor1: string;
                actor2: string;
                country: string;
                region: string;
                admin1: string;
                location: string;
                lat: number;
                lon: number;
                fatalities: number;
                notes: string;
                source: string;
            }>;
            totalCount: number;
        };

        const data = await cachedFetch<ACLEDData>(CACHE_KEY, CACHE_TTL, fetchACLED);

        if (!data) {
            return NextResponse.json(
                { events: [], totalCount: 0, error: "ACLED unavailable — check API token" },
                { status: 200 }
            );
        }

        // Group events by country for summary stats
        const byCountry: Record<string, { count: number; fatalities: number }> = {};
        for (const e of data.events) {
            if (!byCountry[e.country]) byCountry[e.country] = { count: 0, fatalities: 0 };
            byCountry[e.country].count++;
            byCountry[e.country].fatalities += e.fatalities;
        }

        const countrySummary = Object.entries(byCountry)
            .map(([country, stats]) => ({ country, ...stats }))
            .sort((a, b) => b.fatalities - a.fatalities || b.count - a.count)
            .slice(0, 30);

        return NextResponse.json({
            events: data.events,
            totalCount: data.totalCount,
            countrySummary,
            fetchedCount: data.events.length,
        });
    } catch (err) {
        console.error("[api/conflicts/acled]", err);
        return NextResponse.json(
            { events: [], totalCount: 0, error: "Failed to fetch ACLED data" },
            { status: 500 }
        );
    }
}
