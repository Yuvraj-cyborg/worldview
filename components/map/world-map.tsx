"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { NavigationControl, Popup, type MapRef } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";
import useSWR from "swr";
import {
  INTEL_HOTSPOTS, CONFLICT_ZONES, STRATEGIC_WATERWAYS,
  MILITARY_BASES, NUCLEAR_FACILITIES, UNDERSEA_CABLES,
  PIPELINES, ECONOMIC_CENTERS, ESCALATION_COLORS,
} from "@/lib/data/geo";
import { MapControls } from "./map-controls";

// CARTO dark-matter is pitch black. MapTiler adds India worldview=IN borders.
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
}

interface Earthquake {
  id: string;
  place: string;
  magnitude: number;
  lat: number;
  lon: number;
  depth: number;
  time: string;
}

interface UcdpEvent {
  id: string;
  lat: number;
  lon: number;
  country: string;
  sideA: string;
  sideB: string;
  deathsBest: number;
  type: string;
}

interface PopupData {
  lat: number;
  lon: number;
  type: string;
  title: string;
  subtitle?: string;
  detail?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type DeckLayer = ScatterplotLayer | PathLayer | TextLayer;

function useDeckOverlay(layers: MapLayers, earthquakes: Earthquake[], ucdpEvents: UcdpEvent[], zoom: number) {
  return useMemo(() => {
    const deckLayers: DeckLayer[] = [];

    // Cables (PathLayer)
    if (layers.cables) {
      deckLayers.push(
        new PathLayer({
          id: "cables-layer",
          data: UNDERSEA_CABLES,
          getPath: (d) => d.points,
          getColor: [0, 180, 200, 80],
          getWidth: 1.5,
          widthMinPixels: 1,
          widthMaxPixels: 3,
          pickable: true,
        })
      );
    }

    // Conflict zones (ScatterplotLayer - pulsing circles)
    if (layers.conflicts) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "conflict-zones-glow",
          data: CONFLICT_ZONES,
          getPosition: (d) => d.center,
          getRadius: 80000,
          getFillColor: (d) => {
            if (d.intensity === "high") return [239, 68, 68, 40];
            if (d.intensity === "medium") return [249, 115, 22, 30];
            return [234, 179, 8, 25];
          },
          radiusMinPixels: 15,
          radiusMaxPixels: 60,
          pickable: false,
        }),
        new ScatterplotLayer({
          id: "conflict-zones",
          data: CONFLICT_ZONES,
          getPosition: (d) => d.center,
          getRadius: 30000,
          getFillColor: (d) => {
            if (d.intensity === "high") return [239, 68, 68, 160];
            if (d.intensity === "medium") return [249, 115, 22, 140];
            return [234, 179, 8, 120];
          },
          getLineColor: (d) => {
            if (d.intensity === "high") return [239, 68, 68, 200];
            if (d.intensity === "medium") return [249, 115, 22, 180];
            return [234, 179, 8, 160];
          },
          stroked: true,
          lineWidthMinPixels: 1,
          radiusMinPixels: 6,
          radiusMaxPixels: 25,
          pickable: true,
        })
      );
    }

    // Hotspots (diamond markers via ScatterplotLayer)
    if (layers.hotspots) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "hotspots-glow",
          data: INTEL_HOTSPOTS,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 20000,
          getFillColor: (d) => {
            const c = ESCALATION_COLORS[d.escalationScore ?? 1] ?? "#3b82f6";
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 50];
          },
          radiusMinPixels: 10,
          radiusMaxPixels: 30,
          pickable: false,
        }),
        new ScatterplotLayer({
          id: "hotspots",
          data: INTEL_HOTSPOTS,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 8000,
          getFillColor: (d) => {
            const c = ESCALATION_COLORS[d.escalationScore ?? 1] ?? "#3b82f6";
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b, 200];
          },
          radiusMinPixels: 4,
          radiusMaxPixels: 12,
          pickable: true,
        })
      );

      if (zoom >= 3) {
        deckLayers.push(
          new TextLayer({
            id: "hotspot-labels",
            data: INTEL_HOTSPOTS,
            getPosition: (d) => [d.lon, d.lat],
            getText: (d) => d.name,
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

    // Bases (triangles)
    if (layers.bases && zoom >= 2.5) {
      const alpha = Math.min(200, Math.round(Math.max(60, (zoom - 2) * 50)));
      deckLayers.push(
        new ScatterplotLayer({
          id: "bases",
          data: MILITARY_BASES,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 5000,
          getFillColor: (d) => {
            if (d.type === "us-nato") return [59, 130, 246, alpha];
            if (d.type === "russia") return [239, 68, 68, alpha];
            if (d.type === "china") return [234, 179, 8, alpha];
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
      deckLayers.push(
        new ScatterplotLayer({
          id: "waterways",
          data: STRATEGIC_WATERWAYS,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 12000,
          getFillColor: [34, 211, 238, 100],
          getLineColor: [34, 211, 238, 180],
          stroked: true,
          lineWidthMinPixels: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 10,
          pickable: true,
        })
      );
    }

    // Nuclear facilities
    if (layers.nuclear && zoom >= 3) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "nuclear",
          data: NUCLEAR_FACILITIES,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 6000,
          getFillColor: (d) => {
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

    // Earthquakes (real-time USGS)
    if (layers.earthquakes && earthquakes.length > 0) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "earthquakes-glow",
          data: earthquakes,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => Math.pow(2, d.magnitude) * 1500,
          getFillColor: (d) => {
            if (d.magnitude >= 6) return [255, 0, 0, 60];
            if (d.magnitude >= 4.5) return [255, 100, 0, 40];
            return [234, 179, 8, 30];
          },
          radiusMinPixels: 8,
          radiusMaxPixels: 40,
          pickable: false,
        }),
        new ScatterplotLayer({
          id: "earthquakes",
          data: earthquakes,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => Math.pow(2, d.magnitude) * 500,
          getFillColor: (d) => {
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

    // UCDP Conflict Events
    if (layers.ucdp && ucdpEvents.length > 0) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "ucdp-events",
          data: ucdpEvents,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => Math.max(3000, Math.min(20000, (d.deathsBest || 1) * 500)),
          getFillColor: (d) => {
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

    // Pipelines (PathLayer)
    if (layers.pipelines) {
      const oilPipelines = PIPELINES.filter((p) => p.type === "oil");
      const gasPipelines = PIPELINES.filter((p) => p.type === "gas");
      if (oilPipelines.length > 0) {
        deckLayers.push(
          new PathLayer({
            id: "pipelines-oil",
            data: oilPipelines,
            getPath: (d) => d.points,
            getColor: [180, 80, 40, 70],
            getWidth: 1.5,
            widthMinPixels: 1,
            widthMaxPixels: 3,
            pickable: true,
          })
        );
      }
      if (gasPipelines.length > 0) {
        deckLayers.push(
          new PathLayer({
            id: "pipelines-gas",
            data: gasPipelines,
            getPath: (d) => d.points,
            getColor: [80, 140, 200, 70],
            getWidth: 1.5,
            widthMinPixels: 1,
            widthMaxPixels: 3,
            pickable: true,
          })
        );
      }
    }

    // Economic Centers
    if (layers.economic && zoom >= 3) {
      deckLayers.push(
        new ScatterplotLayer({
          id: "economic-centers",
          data: ECONOMIC_CENTERS,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: 6000,
          getFillColor: [34, 197, 94, 120],
          radiusMinPixels: 3,
          radiusMaxPixels: 8,
          pickable: true,
        })
      );
    }

    return deckLayers;
  }, [layers, earthquakes, ucdpEvents, zoom]);
}

export function WorldMap() {
  const mapRef = useRef<MapRef>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [currentView, setCurrentView] = useState("global");
  const [zoom, setZoom] = useState(1.8);
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
  });

  const { data: eqData } = useSWR<{ earthquakes: Earthquake[] }>("/api/geo/earthquakes", fetcher, { refreshInterval: 300_000 });
  const { data: newsData } = useSWR<{ clusters: Array<{ primaryTitle: string }> }>("/api/news/feeds", fetcher, { refreshInterval: 600_000 });
  const { data: ucdpData } = useSWR<{ events: UcdpEvent[] }>("/api/conflicts/ucdp", fetcher, { refreshInterval: 21_600_000 });

  const earthquakes = eqData?.earthquakes ?? [];
  const ucdpEvents = ucdpData?.events ?? [];
  const deckLayers = useDeckOverlay(layers, earthquakes, ucdpEvents, zoom);

  useEffect(() => {
    if (!overlayRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overlayRef.current.setProps({ layers: deckLayers as any[] });
  }, [deckLayers]);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getTooltip(info: any) {
      const { object, layer } = info;
      if (!object) return null;
      const lid: string = layer?.id ?? "";
      if (lid.includes("hotspot") && !lid.includes("glow") && !lid.includes("label")) {
        return { html: `<b>${object.name}</b><br/>${object.subtext ?? ""}` };
      }
      if (lid.includes("conflict") && !lid.includes("glow")) {
        return { html: `<b>${object.name}</b><br/>${object.description ?? ""}` };
      }
      if (lid === "earthquakes") {
        return { html: `<b>M${object.magnitude}</b> ${object.place}` };
      }
      if (lid === "bases") {
        return { html: `<b>${object.name}</b><br/>${object.type?.toUpperCase()}` };
      }
      if (lid === "nuclear") {
        return { html: `<b>${object.name}</b><br/>${object.type} — ${object.status}` };
      }
      if (lid === "cables-layer") {
        return { html: `<b>${object.name}</b>${object.capacityTbps ? `<br/>${object.capacityTbps} Tbps` : ""}` };
      }
      if (lid === "ucdp-events") {
        return { html: `<b>${object.country}</b><br/>${object.sideA} vs ${object.sideB}<br/>Deaths: ${object.deathsBest}` };
      }
      if (lid === "waterways") {
        return { html: `<b>${object.name}</b><br/>${object.description ?? ""}` };
      }
      if (lid.startsWith("pipelines-")) {
        return { html: `<b>${object.name}</b><br/>${object.type} pipeline${object.status ? ` — ${object.status}` : ""}` };
      }
      if (lid === "economic-centers") {
        return { html: `<b>${object.name}</b><br/>${object.type}` };
      }
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleClick(info: any) {
      const { object, layer } = info;
      if (!object) return;
      const lid: string = layer?.id ?? "";
      if (lid.includes("hotspot") && !lid.includes("glow") && !lid.includes("label")) {
        setPopup({ lat: object.lat, lon: object.lon, type: "hotspot", title: object.name, subtitle: object.subtext ?? object.location, detail: object.whyItMatters });
      } else if (lid.includes("conflict") && !lid.includes("glow")) {
        setPopup({ lat: object.center[1], lon: object.center[0], type: "conflict", title: object.name, subtitle: object.parties?.join(" vs "), detail: object.description });
      } else if (lid === "earthquakes") {
        setPopup({ lat: object.lat, lon: object.lon, type: "earthquake", title: `M${object.magnitude} — ${object.place}`, subtitle: `Depth: ${object.depth}km`, detail: new Date(object.time).toLocaleString() });
      } else if (lid === "bases") {
        setPopup({ lat: object.lat, lon: object.lon, type: "base", title: object.name, subtitle: `${object.type.toUpperCase()} — ${object.country ?? ""}` });
      } else if (lid === "nuclear") {
        setPopup({ lat: object.lat, lon: object.lon, type: "nuclear", title: object.name, subtitle: `${object.type} — ${object.status}` });
      } else if (lid === "ucdp-events") {
        setPopup({ lat: object.lat, lon: object.lon, type: "conflict event", title: `${object.sideA} vs ${object.sideB}`, subtitle: object.country, detail: `${object.deathsBest} deaths (${object.type})` });
      }
    }

    const overlay = new MapboxOverlay({
      interleaved: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layers: deckLayers as any[],
      getTooltip,
      onClick: handleClick,
      pickingRadius: 12,
    });

    overlayRef.current = overlay;
    map.addControl(overlay as unknown as maplibregl.IControl);
  }, [deckLayers]);

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
        onClick={() => setPopup(null)}
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
            <div className="text-xs max-w-[240px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{popup.type}</span>
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
