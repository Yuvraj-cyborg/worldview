import { NextResponse } from "next/server";

export const revalidate = 30;

const MILITARY_ICAO_PREFIXES = [
  "AE", "AF", "AN", "AP", "AQ", "AR", "AT",
  "LAGR", "DUKE", "EVAC", "GOTO", "JAKE", "NCHO",
  "RCH", "RRR", "CNV", "CFC",
];

export async function GET() {
  try {
    const resp = await fetch(
      "https://opensky-network.org/api/states/all",
      { signal: AbortSignal.timeout(10000), next: { revalidate: 30 } }
    );

    if (!resp.ok) {
      return NextResponse.json({ flights: [], error: "OpenSky unavailable" });
    }

    const data = await resp.json();
    const states = data.states ?? [];

    const militaryFlights = states
      .filter((s: (string | number | boolean | null)[]) => {
        const callsign = (s[1] as string)?.trim() ?? "";
        const icao24 = (s[0] as string) ?? "";
        return MILITARY_ICAO_PREFIXES.some(
          (p) => callsign.startsWith(p) || icao24.startsWith(p.toLowerCase())
        );
      })
      .map((s: (string | number | boolean | null)[]) => ({
        icao24: s[0] as string,
        callsign: (s[1] as string)?.trim(),
        originCountry: s[2] as string,
        lon: s[5] as number | null,
        lat: s[6] as number | null,
        altitude: s[7] as number | null,
        velocity: s[9] as number | null,
        heading: s[10] as number | null,
        onGround: s[8] as boolean,
      }))
      .filter((f: { lat: number | null; lon: number | null }) => f.lat !== null && f.lon !== null);

    return NextResponse.json({
      flights: militaryFlights,
      count: militaryFlights.length,
      totalAircraft: states.length,
    });
  } catch (err) {
    console.error("[api/military/flights]", err);
    return NextResponse.json({ flights: [], error: "Failed" }, { status: 500 });
  }
}
