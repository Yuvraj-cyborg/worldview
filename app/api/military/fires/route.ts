import { NextResponse } from "next/server";

export const revalidate = 600;

export async function GET() {
  const apiKey = process.env.NASA_FIRMS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ fires: [], count: 0, note: "Set NASA_FIRMS_API_KEY in .env (free at firms.modaps.eosdis.nasa.gov)" });
  }

  try {
    const resp = await fetch(
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/world/1`,
      { signal: AbortSignal.timeout(15000), next: { revalidate: 600 } }
    );

    if (!resp.ok) {
      return NextResponse.json({ fires: [], count: 0, error: "FIRMS API error" }, { status: 502 });
    }

    const text = await resp.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const headers = lines[0]?.split(",") ?? [];
    const col = (name: string) => headers.indexOf(name);

    const fires = lines
      .slice(1, 300)
      .map((line) => {
        const c = line.split(",");
        return {
          lat: parseFloat(c[col("latitude")] ?? "0"),
          lon: parseFloat(c[col("longitude")] ?? "0"),
          brightness: parseFloat(c[col("bright_ti4")] ?? "0"),
          frp: parseFloat(c[col("frp")] ?? "0"),
          acqDate: c[col("acq_date")] ?? "",
          acqTime: c[col("acq_time")] ?? "",
          confidence: c[col("confidence")] ?? "low",
          satellite: c[col("satellite")] ?? "VIIRS",
        };
      })
      .filter((f) => !isNaN(f.lat) && !isNaN(f.lon) && f.frp > 0)
      .sort((a, b) => b.brightness - a.brightness);

    return NextResponse.json({ fires, count: fires.length });
  } catch (err) {
    console.error("[api/military/fires]", err);
    return NextResponse.json({ fires: [], count: 0, error: "Failed" }, { status: 500 });
  }
}
