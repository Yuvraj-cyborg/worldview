import { NextResponse } from "next/server";

export const revalidate = 21600; // 6 hours

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const yearsToTry = [currentYear, currentYear - 1, currentYear - 2];
    let resp: Response | null = null;

    for (const year of yearsToTry) {
      try {
        const r = await fetch(
          `https://ucdpapi.pcr.uu.se/api/gedevents/24.1?pagesize=100&page=0&Year=${year}`,
          { signal: AbortSignal.timeout(8000), next: { revalidate: 21600 } }
        );
        if (r.ok) {
          resp = r;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!resp) {
      return NextResponse.json({ events: [], note: "UCDP data unavailable for recent years" });
    }

    const data = await resp.json();
    const rawEvents = data.Result || [];

    const events = rawEvents.map((e: {
      id: number;
      date_start: string;
      date_end: string;
      latitude: number;
      longitude: number;
      country: string;
      side_a: string;
      side_b: string;
      best: number;
      low: number;
      high: number;
      type_of_violence: number;
      source_original: string;
    }) => ({
      id: String(e.id),
      dateStart: e.date_start,
      dateEnd: e.date_end,
      lat: e.latitude,
      lon: e.longitude,
      country: e.country,
      sideA: e.side_a,
      sideB: e.side_b,
      deathsBest: e.best,
      deathsLow: e.low,
      deathsHigh: e.high,
      type: e.type_of_violence === 1 ? "state-based" : e.type_of_violence === 2 ? "non-state" : "one-sided",
      source: e.source_original,
    }));

    return NextResponse.json({ events, count: events.length });
  } catch (err) {
    console.error("[api/conflicts/ucdp]", err);
    return NextResponse.json({ events: [], error: "Failed to fetch" }, { status: 500 });
  }
}
