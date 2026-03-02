import { NextResponse } from "next/server";

export const revalidate = 3600;

const SERIES = [
  { id: "DGS10", name: "10Y Treasury", unit: "%" },
  { id: "DGS2", name: "2Y Treasury", unit: "%" },
  { id: "FEDFUNDS", name: "Fed Funds Rate", unit: "%" },
  { id: "CPIAUCSL", name: "CPI (YoY)", unit: "%" },
  { id: "UNRATE", name: "Unemployment", unit: "%" },
];

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ indicators: [], note: "No FRED API key configured" });
  }

  try {
    const results = await Promise.allSettled(
      SERIES.map(async (s) => {
        const resp = await fetch(
          `https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`,
          { signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const obs = data.observations ?? [];
        const latest = obs[0];
        const prev = obs[1];
        if (!latest) return null;

        const value = parseFloat(latest.value);
        const prevValue = prev ? parseFloat(prev.value) : null;

        return {
          id: s.id,
          name: s.name,
          unit: s.unit,
          value: isNaN(value) ? null : value,
          previousValue: prevValue && !isNaN(prevValue) ? prevValue : null,
          change: prevValue && !isNaN(prevValue) && !isNaN(value) ? Math.round((value - prevValue) * 100) / 100 : null,
          date: latest.date,
        };
      })
    );

    const indicators = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);

    return NextResponse.json({ indicators, count: indicators.length });
  } catch (err) {
    console.error("[api/markets/macro]", err);
    return NextResponse.json({ indicators: [], error: "Failed" }, { status: 500 });
  }
}
