import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET(request: Request) {
  try {
    const baseUrl = new URL(request.url).origin;
    const signals: Array<{
      type: string;
      label: string;
      count: number;
      severity: "low" | "medium" | "high";
      countries: string[];
      source: string;
    }> = [];

    // Fetch earthquakes
    try {
      const eqResp = await fetch(`${baseUrl}/api/geo/earthquakes`, { signal: AbortSignal.timeout(6000) });
      if (eqResp.ok) {
        const eqData = await eqResp.json();
        const quakes = eqData.earthquakes || [];
        const significant = quakes.filter((q: { magnitude: number }) => q.magnitude >= 4);
        const places = [...new Set(quakes.slice(0, 10).map((q: { place: string }) => {
          const parts = q.place?.split(", ");
          return parts?.[parts.length - 1] ?? "Unknown";
        }))].slice(0, 5) as string[];

        signals.push({
          type: "earthquake",
          label: "Seismic Events",
          count: quakes.length,
          severity: significant.length > 3 ? "high" : significant.length > 0 ? "medium" : "low",
          countries: places,
          source: "USGS",
        });
      }
    } catch { /* continue */ }

    // Fetch UCDP conflicts
    try {
      const ucdpResp = await fetch(`${baseUrl}/api/conflicts/ucdp`, { signal: AbortSignal.timeout(8000) });
      if (ucdpResp.ok) {
        const ucdpData = await ucdpResp.json();
        const events = ucdpData.events || [];
        const countries = [...new Set(events.map((e: { country: string }) => e.country))].slice(0, 5) as string[];
        const totalDeaths = events.reduce((s: number, e: { deathsBest: number }) => s + (e.deathsBest || 0), 0);

        signals.push({
          type: "conflict",
          label: "Armed Conflicts",
          count: events.length,
          severity: totalDeaths > 100 ? "high" : events.length > 20 ? "medium" : "low",
          countries,
          source: "UCDP",
        });
      }
    } catch { /* continue */ }

    // Derive from news
    try {
      const newsResp = await fetch(`${baseUrl}/api/news/feeds`, { signal: AbortSignal.timeout(6000) });
      if (newsResp.ok) {
        const newsData = await newsResp.json();
        const clusters = newsData.clusters || [];

        const criticalNews = clusters.filter(
          (c: { threat?: { level: string } }) => c.threat?.level === "critical" || c.threat?.level === "high"
        );

        if (criticalNews.length > 0) {
          signals.push({
            type: "threat_intel",
            label: "High-Threat News",
            count: criticalNews.length,
            severity: criticalNews.length > 10 ? "high" : criticalNews.length > 3 ? "medium" : "low",
            countries: [],
            source: "RSS Aggregation",
          });
        }

        signals.push({
          type: "news_volume",
          label: "News Volume",
          count: newsData.totalItems || clusters.length,
          severity: "low",
          countries: [],
          source: `${newsData.feedsLoaded || 0} feeds`,
        });
      }
    } catch { /* continue */ }

    return NextResponse.json({
      signals,
      totalSignals: signals.reduce((s, sig) => s + sig.count, 0),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[api/intelligence/signals]", err);
    return NextResponse.json({ signals: [], error: "Failed to aggregate" }, { status: 500 });
  }
}
