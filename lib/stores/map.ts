import { create } from "zustand";

export type MapView = "global" | "americas" | "europe" | "mena" | "asia" | "africa" | "oceania";

export interface MapLayers {
  hotspots: boolean;
  conflicts: boolean;
  bases: boolean;
  waterways: boolean;
  earthquakes: boolean;
  nuclear: boolean;
  cables: boolean;
  fires: boolean;
  flights: boolean;
}

interface MapStore {
  view: MapView;
  layers: MapLayers;
  zoom: number;
  center: { lat: number; lon: number };
  setView: (view: MapView) => void;
  toggleLayer: (key: keyof MapLayers) => void;
  setZoom: (zoom: number) => void;
  setCenter: (lat: number, lon: number) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  view: "global",
  layers: {
    hotspots: true,
    conflicts: true,
    bases: true,
    waterways: true,
    earthquakes: true,
    nuclear: false,
    cables: false,
    fires: false,
    flights: false,
  },
  zoom: 1.8,
  center: { lat: 20, lon: 20 },

  setView: (view) => set({ view }),
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  setZoom: (zoom) => set({ zoom }),
  setCenter: (lat, lon) => set({ center: { lat, lon } }),
}));
