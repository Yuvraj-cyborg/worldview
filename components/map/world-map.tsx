"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GeoJsonLayer, ScatterplotLayer, PathLayer, TextLayer, PolygonLayer, ArcLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import useSWR from "swr";
import {
  INTEL_HOTSPOTS, CONFLICT_ZONES, STRATEGIC_WATERWAYS,
  MILITARY_BASES, NUCLEAR_FACILITIES, UNDERSEA_CABLES,
  PIPELINES, ECONOMIC_CENTERS, ESCALATION_COLORS,
} from "@/lib/data/geo";
import { MapControls } from "./map-controls";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const DARK_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/backdrop-dark/style.json?key=${MAPTILER_KEY}&worldview=IN`
  : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const VIEW_PRESETS: Record<string, { longitude: number; latitude: number; zoom: number }> = {
  global: { longitude: 20, latitude: 20, zoom: 1.8 },
  india: { longitude: 78, latitude: 23, zoom: 3.5 },
  americas: { longitude: -95, latitude: 38, zoom: 3 },
  mena: { longitude: 45, latitude: 28, zoom: 3.5 },
  europe: { longitude: 15, latitude: 50, zoom: 3.5 },
  asia: { longitude: 105, latitude: 35, zoom: 3 },
  africa: { longitude: 20, latitude: 5, zoom: 3 },
};

export interface MapLayers {
  hotspots: boolean;
  conflicts: boolean;
  bases: boolean;
  waterways: boolean;
  earthquakes: boolean;
  nuclear: boolean;
  cables: boolean;
  pipelines: boolean;
  economic: boolean;
  ucdp: boolean;
  daynight: boolean;
}

interface Earthquake {
  id: string; place: string; magnitude: number; lat: number; lon: number; depth: number; time: string;
}
interface UcdpEvent {
  id: string; lat: number; lon: number; country: string; sideA: string; sideB: string; deathsBest: number; type: string;
}
interface PopupData {
  lat: number; lon: number; type: string; title: string; subtitle?: string; detail?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CONFLICT_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: CONFLICT_ZONES.map((z) => ({
    type: "Feature" as const,
    properties: { id: z.id, name: z.name, intensity: z.intensity, parties: z.parties.join(" vs "), description: z.description, casualties: z.casualties, startDate: z.startDate },
    geometry: { type: "Polygon" as const, coordinates: [z.coords] },
  })),
};

function computeNightPolygon(): [number, number][] {
  const now = new Date();
  const JD = now.getTime() / 86400000 + 2440587.5;
  const D = JD - 2451545.0;
  const g = ((357.529 + 0.98560028 * D) % 360) * Math.PI / 180;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = ((q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360) * Math.PI / 180;
  const e = 23.439 * Math.PI / 180;
  const decl = Math.asin(Math.sin(e) * Math.sin(L));
  const RA = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const GMST = (280.46061837 + 360.98564736629 * D) % 360;
  const subSolarLon = ((RA * 180 / Math.PI - GMST) % 360 + 540) % 360 - 180;

  const pts: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 2) {
    const ha = (lon - subSolarLon) * Math.PI / 180;
    const lat = Math.atan(-Math.cos(ha) / Math.tan(decl)) * 180 / Math.PI;
    pts.push([lon, lat]);
  }

  const darkPole = decl > 0 ? -90 : 90;
  return [...pts, [180, darkPole], [-180, darkPole]];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeckLayer = any;

function useDeckOverlay(
  layers: MapLayers, earthquakes: Earthquake[], ucdpEvents: UcdpEvent[],
  zoom: number, pulseTime: number
) {
  return useMemo(() => {
    const dl: DeckLayer[] = [];
    const pulse = 1.0 + 0.8 * (0.5 + 0.5 * Math.sin(pulseTime / 400));
    const slowPulse = 1.0 + 0.4 * (0.5 + 0.5 * Math.sin(pulseTime / 800));

    // Day/Night overlay
    if (layers.daynight) {
      const nightPoly = computeNightPolygon();
      dl.push(
        new PolygonLayer({
          id: "daynight",
          data: [{ polygon: nightPoly }],
          getPolygon: (d: { polygon: [number, number][] }) => d.polygon,
          getFillColor: [0, 0, 15, 50],
          getLineColor: [100, 130, 180, 40],
          lineWidthMinPixels: 1,
          pickable: false,
        })
      );
    }

    // Cables
    if (layers.cables) {
      dl.push(
        new PathLayer({
          id: "cables-layer",
          data: UNDERSEA_CABLES,
          getPath: (d: { points: [number, number][] }) => d.points,
          getColor: [0, 180, 200, 80],
          getWidth: 1.5,
          widthMinPixels: 1,
          widthMaxPixels: 3,
          pickable: true,
        })
      );
    }

    // Conflict Zone Polygons (GeoJSON)
    if (layers.conflicts) {
      dl.push(
        new GeoJsonLayer({
          id: "conflict-polygons",
          data: CONFLICT_GEOJSON,
          filled: true,
          stroked: true,
          getFillColor: (f: GeoJSON.Feature) => {
            const i = f.properties?.intensity;
            if (i === "high") return [239, 50, 50, 30];
            if (i === "medium") return [249, 115, 22, 20];
            return [234, 179, 8, 15];
          },
          getLineColor: (f: GeoJSON.Feature) => {
            const i = f.properties?.intensity;
            if (i === "high") return [239, 68, 68, 140];
            if (i === "medium") return [249, 115, 22, 100];
            return [234, 179, 8, 80];
          },
          lineWidthMinPixels: 1.5,
          pickable: true,
          autoHighlight: true,
          highlightColor: [239, 68, 68, 60],
        }),
        new ScatterplotLayer({
          id: "conflict-centers",
          data: CONFLICT_ZONES,
          getPosition: (d: { center: [number, number] }) => d.center,
          getRadius: 25000 * pulse,
          getFillColor: (d: { intensity: string }) => {
            if (d.intensity === "high") return [239, 68, 68, 100];
            if (d.intensity === "medium") return [249, 115, 22, 80];
            return [234, 179, 8, 60];
          },
          radiusMinPixels: 8,
          radiusMaxPixels: 30,
          pickable: false,
          updateTriggers: { getRadius: pulseTime },
        }),
        new ScatterplotLayer({
          id: "conflict-core",
          data: CONFLICT_ZONES,
          getPosition: (d: { center: [number, number] }) => d.center,
          getRadius: 8000,
          getFillColor: (d: { intensity: string }) => {
            if (d.intensity === "high") return [255, 80, 80, 220];
            if (d.intensity === "medium") return [249, 115, 22, 200];
            return [234, 179, 8, 180];
          },
          getLineColor: [255, 255, 255, 60],
          stroked: true,
          lineWidthMinPixels: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 12,
          pickable: true,
        })
      );

      if (zoom >= 2.5) {
        dl.push(
          new TextLayer({
            id: "conflict-labels",
            data: CONFLICT_ZONES,
            getPosition: (d: { center: [number, number] }) => d.center,
            getText: (d: { name: string }) => d.name,
            getColor: [255, 120, 120, 200],
            getSize: 11,
            getPixelOffset: [0, -18],
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            pickable: false,
          })
        );
      }
    }

    // Hotspots with pulsing
    if (layers.hotspots) {
      dl.push(
        new ScatterplotLayer({
          id: "hotspots-pulse",
          data: INTEL_HOTSPOTS,
          getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
          getRadius: 18000 * pulse,
          getFillColor: (d: { escalationScore?: number }) => {
            const c = ESCALATION_COLORS[d.escalationScore ?? 1] ?? "#3b82f6";
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 40];
          },
          radiusMinPixels: 8,
          radiusMaxPixels: 25,
          pickable: false,
          updateTriggers: { getRadius: pulseTime },
        }),
        new ScatterplotLayer({
          id: "hotspots",
          data: INTEL_HOTSPOTS,
          getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
          getRadius: 6000,
          getFillColor: (d: { escalationScore?: number }) => {
            const c = ESCALATION_COLORS[d.escalationScore ?? 1] ?? "#3b82f6";
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 220];
          },
          getLineColor: [255, 255, 255, 40],
          stroked: true,
          lineWidthMinPixels: 0.5,
          radiusMinPixels: 3,
          radiusMaxPixels: 10,
          pickable: true,
        })
      );

      if (zoom >= 3) {
        dl.push(
          new TextLayer({
            id: "hotspot-labels",
            data: INTEL_HOTSPOTS,
            getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
            getText: (d: { name: string }) => d.name,
            getColor: [200, 200, 200, 180],
            getSize: 11,
            getPixelOffset: [0, -14],
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            pickable: false,
          })
        );
      }
    }

    // Military Bases
    if (layers.bases && zoom >= 2.5) {
      const alpha = Math.min(200, Math.round(Math.max(60, (zoom - 2) * 50)));
      dl.push(
        new ScatterplotLayer({
          id: "bases",
          data: MILITARY_BASES,
          getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
          getRadius: 5000,
          getFillColor: (d: { type: string }) => {
            if (d.type === "us-nato") return [59, 130, 246, alpha];
            if (d.type === "russia") return [239, 68, 68, alpha];
            if (d.type === "china") return [234, 179, 8, alpha];
            if (d.type === "india") return [255, 150, 50, alpha];
            if (d.type === "uk") return [100, 160, 255, alpha];
            if (d.type === "france") return [80, 140, 220, alpha];
            return [107, 114, 128, alpha];
          },
          radiusMinPixels: 3,
          radiusMaxPixels: 8,
          pickable: true,
        })
      );
    }

    // Waterways
    if (layers.waterways) {
      dl.push(
        new ScatterplotLayer({
          id: "waterways",
          data: STRATEGIC_WATERWAYS,
          getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
          getRadius: 12000 * slowPulse,
          getFillColor: [34, 211, 238, 80],
          getLineColor: [34, 211, 238, 160],
          stroked: true,
          lineWidthMinPixels: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 12,
          pickable: true,
          updateTriggers: { getRadius: pulseTime },
        })
      );
      if (zoom >= 3) {
        dl.push(
          new TextLayer({
            id: "waterway-labels",
            data: STRATEGIC_WATERWAYS,
            getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
            getText: (d: { name: string }) => d.name,
            getColor: [34, 211, 238, 160],
            getSize: 10,
            getPixelOffset: [0, -14],
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            pickable: false,
          })
        );
      }
    }

    // Nuclear facilities
    if (layers.nuclear && zoom >= 3) {
      dl.push(
        new ScatterplotLayer({
          id: "nuclear",
          data: NUCLEAR_FACILITIES,
          getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
          getRadius: 6000,
          getFillColor: (d: { type: string; status: string }) => {
            if (d.type === "weapons") return [168, 85, 247, 180];
            if (d.type === "enrichment") return [236, 72, 153, 180];
            if (d.status === "contested") return [239, 68, 68, 200];
            return [168, 85, 247, 120];
          },
          radiusMinPixels: 3,
          radiusMaxPixels: 8,
          pickable: true,
        })
      );
    }

    // Earthquakes with pulsing glow
    if (layers.earthquakes && earthquakes.length > 0) {
      dl.push(
        new ScatterplotLayer({
          id: "earthquakes-glow",
          data: earthquakes,
          getPosition: (d: Earthquake) => [d.lon, d.lat],
          getRadius: (d: Earthquake) => Math.pow(2, d.magnitude) * 1500 * slowPulse,
          getFillColor: (d: Earthquake) => {
            if (d.magnitude >= 6) return [255, 0, 0, 50];
            if (d.magnitude >= 4.5) return [255, 100, 0, 35];
            return [234, 179, 8, 25];
          },
          radiusMinPixels: 8,
          radiusMaxPixels: 40,
          pickable: false,
          updateTriggers: { getRadius: pulseTime },
        }),
        new ScatterplotLayer({
          id: "earthquakes",
          data: earthquakes,
          getPosition: (d: Earthquake) => [d.lon, d.lat],
          getRadius: (d: Earthquake) => Math.pow(2, d.magnitude) * 500,
          getFillColor: (d: Earthquake) => {
            if (d.magnitude >= 6) return [255, 0, 0, 200];
            if (d.magnitude >= 4.5) return [255, 100, 0, 180];
            return [234, 179, 8, 150];
          },
          radiusMinPixels: 3,
          radiusMaxPixels: 20,
          pickable: true,
        })
      );
    }

    // UCDP Conflict Events with pulsing
    if (layers.ucdp && ucdpEvents.length > 0) {
      dl.push(
        new ScatterplotLayer({
          id: "ucdp-pulse",
          data: ucdpEvents.filter((d) => d.deathsBest >= 10),
          getPosition: (d: UcdpEvent) => [d.lon, d.lat],
          getRadius: (d: UcdpEvent) => Math.max(10000, d.deathsBest * 300) * pulse,
          getFillColor: [239, 68, 68, 30],
          radiusMinPixels: 6,
          radiusMaxPixels: 25,
          pickable: false,
          updateTriggers: { getRadius: pulseTime },
        }),
        new ScatterplotLayer({
          id: "ucdp-events",
          data: ucdpEvents,
          getPosition: (d: UcdpEvent) => [d.lon, d.lat],
          getRadius: (d: UcdpEvent) => Math.max(3000, Math.min(20000, (d.deathsBest || 1) * 500)),
          getFillColor: (d: UcdpEvent) => {
            if (d.type === "state-based") return [239, 68, 68, 150];
            if (d.type === "non-state") return [249, 115, 22, 130];
            return [168, 85, 247, 120];
          },
          radiusMinPixels: 2,
          radiusMaxPixels: 15,
          pickable: true,
        })
      );
    }

    // Pipelines
    if (layers.pipelines) {
      const oil = PIPELINES.filter((p) => p.type === "oil");
      const gas = PIPELINES.filter((p) => p.type === "gas");
      if (oil.length > 0) {
        dl.push(new PathLayer({
          id: "pipelines-oil", data: oil,
          getPath: (d: { points: [number, number][] }) => d.points,
          getColor: [180, 80, 40, 70], getWidth: 1.5, widthMinPixels: 1, widthMaxPixels: 3, pickable: true,
        }));
      }
      if (gas.length > 0) {
        dl.push(new PathLayer({
          id: "pipelines-gas", data: gas,
          getPath: (d: { points: [number, number][] }) => d.points,
          getColor: [80, 140, 200, 70], getWidth: 1.5, widthMinPixels: 1, widthMaxPixels: 3, pickable: true,
        }));
      }
    }

    // Economic Centers
    if (layers.economic && zoom >= 3) {
      dl.push(new ScatterplotLayer({
        id: "economic-centers", data: ECONOMIC_CENTERS,
        getPosition: (d: { lon: number; lat: number }) => [d.lon, d.lat],
        getRadius: 6000, getFillColor: [34, 197, 94, 120],
        radiusMinPixels: 3, radiusMaxPixels: 8, pickable: true,
      }));
    }

    return dl;
  }, [layers, earthquakes, ucdpEvents, zoom, pulseTime]);
}

export function WorldMap({ onCountryClick }: { onCountryClick?: (name: string) => void }) {
  const mapRef = useRef<MapRef>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [currentView, setCurrentView] = useState("global");
  const [zoom, setZoom] = useState(1.8);
  const [pulseTime, setPulseTime] = useState(Date.now());
  const animFrameRef = useRef<number>(0);
  const [layers, setLayers] = useState<MapLayers>({
    hotspots: true,
    conflicts: true,
    bases: true,
    waterways: true,
    earthquakes: true,
    nuclear: true,
    cables: true,
    pipelines: true,
    economic: false,
    ucdp: true,
    daynight: true,
  });

  const { data: eqData } = useSWR<{ earthquakes: Earthquake[] }>("/api/geo/earthquakes", fetcher, { refreshInterval: 300_000 });
  const { data: newsData } = useSWR<{ clusters: Array<{ primaryTitle: string }> }>("/api/news/feeds", fetcher, { refreshInterval: 600_000 });
  const { data: ucdpData } = useSWR<{ events: UcdpEvent[] }>("/api/conflicts/ucdp", fetcher, { refreshInterval: 21_600_000 });

  const earthquakes = eqData?.earthquakes ?? [];
  const ucdpEvents = ucdpData?.events ?? [];
  const deckLayers = useDeckOverlay(layers, earthquakes, ucdpEvents, zoom, pulseTime);

  // Pulse animation loop
  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      setPulseTime(Date.now());
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers: deckLayers });
  }, [deckLayers]);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getTooltip(info: any) {
      const { object, layer } = info;
      if (!object) return null;
      const lid: string = layer?.id ?? "";

      if (lid === "conflict-polygons") {
        const p = object.properties;
        return { html: `<b style="color:#ef4444">⚔ ${p.name}</b><br/>${p.parties}<br/>${p.casualties ?? ""}`, style: { backgroundColor: "rgba(20,10,10,0.95)", color: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", maxWidth: "280px" } };
      }
      if (lid === "conflict-core") {
        return { html: `<b style="color:#ef4444">⚔ ${object.name}</b><br/>${object.parties?.join(" vs ")}`, style: { backgroundColor: "rgba(20,10,10,0.95)", color: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px" } };
      }
      if (lid === "hotspots") {
        const color = ESCALATION_COLORS[object.escalationScore ?? 1] ?? "#3b82f6";
        return { html: `<b style="color:${color}">● ${object.name}</b><br/>${object.subtext ?? ""}<br/>${object.whyItMatters ?? ""}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${color}40`, fontSize: "12px", maxWidth: "280px" } };
      }
      if (lid === "earthquakes") {
        return { html: `<b>M${object.magnitude}</b> ${object.place}<br/>Depth: ${object.depth}km`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "bases") {
        return { html: `<b>${object.name}</b><br/>${object.type?.toUpperCase()} — ${object.country}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "nuclear") {
        return { html: `<b>${object.name}</b><br/>${object.type} — ${object.status}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "cables-layer") {
        return { html: `<b>${object.name}</b>${object.capacityTbps ? `<br/>${object.capacityTbps} Tbps` : ""}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "ucdp-events") {
        return { html: `<b>${object.country}</b><br/>${object.sideA} vs ${object.sideB}<br/>Deaths: ${object.deathsBest}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "waterways") {
        return { html: `<b>${object.name}</b><br/>${object.description ?? ""}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid.startsWith("pipelines-")) {
        return { html: `<b>${object.name}</b><br/>${object.type} pipeline`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      if (lid === "economic-centers") {
        return { html: `<b>${object.name}</b><br/>${object.type}`, style: { backgroundColor: "rgba(10,10,20,0.95)", color: "#fff", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" } };
      }
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(info: any) {
      const { object, layer, coordinate } = info;

      if (object && layer) {
        const lid: string = layer.id ?? "";
        if (lid === "conflict-polygons") {
          const p = object.properties;
          setPopup({ lat: coordinate[1], lon: coordinate[0], type: "war zone", title: p.name, subtitle: p.parties, detail: `${p.casualties ?? ""} ${p.startDate ? `Since ${p.startDate}` : ""}`.trim() });
          return;
        }
        if (lid.includes("hotspot") && !lid.includes("pulse") && !lid.includes("label")) {
          setPopup({ lat: object.lat, lon: object.lon, type: "hotspot", title: object.name, subtitle: object.subtext ?? object.location, detail: object.whyItMatters });
          return;
        }
        if (lid === "conflict-core") {
          setPopup({ lat: object.center[1], lon: object.center[0], type: "war zone", title: object.name, subtitle: object.parties?.join(" vs "), detail: `${object.casualties ?? ""} ${object.startDate ? `Since ${object.startDate}` : ""}`.trim() });
          return;
        }
        if (lid === "earthquakes") {
          setPopup({ lat: object.lat, lon: object.lon, type: "earthquake", title: `M${object.magnitude} — ${object.place}`, subtitle: `Depth: ${object.depth}km`, detail: new Date(object.time).toLocaleString() });
          return;
        }
        if (lid === "bases") {
          setPopup({ lat: object.lat, lon: object.lon, type: "base", title: object.name, subtitle: `${object.type.toUpperCase()} — ${object.country ?? ""}` });
          return;
        }
        if (lid === "nuclear") {
          setPopup({ lat: object.lat, lon: object.lon, type: "nuclear", title: object.name, subtitle: `${object.type} — ${object.status}` });
          return;
        }
        if (lid === "ucdp-events") {
          setPopup({ lat: object.lat, lon: object.lon, type: "conflict event", title: `${object.sideA} vs ${object.sideB}`, subtitle: object.country, detail: `${object.deathsBest} deaths (${object.type})` });
          return;
        }
      }

      // Country click detection via MapLibre rendered features
      if (coordinate && onCountryClick) {
        const mapInstance = mapRef.current?.getMap();
        if (mapInstance) {
          const point = mapInstance.project(coordinate as [number, number]);
          const features = mapInstance.queryRenderedFeatures(point);
          for (const f of features) {
            const name = f.properties?.["name:en"] || f.properties?.name || f.properties?.NAME;
            const code = f.properties?.["ISO3166-1-Alpha-2"] || f.properties?.iso_a2;
            if (name && typeof name === "string" && name.length > 1) {
              onCountryClick(name);
              return;
            }
            if (code && typeof code === "string" && code.length === 2) {
              onCountryClick(code);
              return;
            }
          }
        }
      }

      setPopup(null);
    }

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: deckLayers,
      getTooltip,
      onClick: handleClick,
      pickingRadius: 12,
    });

    overlayRef.current = overlay;
    map.addControl(overlay as unknown as maplibregl.IControl);
  }, [deckLayers, onCountryClick]);

  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    const preset = VIEW_PRESETS[view] ?? VIEW_PRESETS.global;
    mapRef.current?.flyTo({
      center: [preset!.longitude, preset!.latitude],
      zoom: preset!.zoom,
      duration: 1200,
    });
  }, []);

  const toggleLayer = useCallback((key: keyof MapLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 20, latitude: 20, zoom: 1.8 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={DARK_STYLE}
        renderWorldCopies={false}
        attributionControl={false}
        onLoad={onMapLoad}
        onZoom={(e) => setZoom(e.viewState.zoom)}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {popup && (
          <Popup
            longitude={popup.lon}
            latitude={popup.lat}
            anchor="bottom"
            onClose={() => setPopup(null)}
            closeOnClick={false}
            className="worldview-popup"
          >
            <div className="text-xs max-w-[260px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  popup.type === "war zone" ? "text-red-400" :
                  popup.type === "hotspot" ? "text-orange-400" :
                  popup.type === "earthquake" ? "text-yellow-400" :
                  "text-muted-foreground"
                }`}>{popup.type}</span>
              </div>
              <p className="font-semibold text-foreground text-[13px] leading-tight">{popup.title}</p>
              {popup.subtitle && <p className="text-muted-foreground mt-0.5">{popup.subtitle}</p>}
              {popup.detail && <p className="text-muted-foreground mt-1 leading-relaxed">{popup.detail}</p>}
            </div>
          </Popup>
        )}
      </Map>

      <MapControls
        currentView={currentView}
        onViewChange={handleViewChange}
        layers={layers}
        onToggleLayer={toggleLayer}
        earthquakeCount={earthquakes.length}
        newsCount={newsData?.clusters?.length ?? 0}
        ucdpCount={ucdpEvents.length}
      />
    </div>
  );
}
