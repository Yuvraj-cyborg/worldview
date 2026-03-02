import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const resp = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
      { signal: AbortSignal.timeout(8000), next: { revalidate: 300 } }
    );

    if (!resp.ok) {
      return NextResponse.json({ earthquakes: [] }, { status: 502 });
    }

    const data = await resp.json();
    const features = data.features || [];

    const earthquakes = features.slice(0, 100).map((f: {
      id: string;
      properties: { place: string; mag: number; time: number; url: string };
      geometry: { coordinates: number[] };
    }) => ({
      id: f.id,
      place: f.properties.place,
      magnitude: f.properties.mag,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      time: new Date(f.properties.time).toISOString(),
      url: f.properties.url,
    }));

    return NextResponse.json({ earthquakes, count: earthquakes.length });
  } catch (err) {
    console.error("[api/geo/earthquakes]", err);
    return NextResponse.json({ earthquakes: [], error: "Failed to fetch" }, { status: 500 });
  }
}
