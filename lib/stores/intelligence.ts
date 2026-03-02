import { create } from "zustand";
import type { FocalPoint, CountryScore, Hotspot } from "@/lib/types";

interface IntelligenceStore {
  ciiScores: CountryScore[];
  focalPoints: FocalPoint[];
  hotspots: Hotspot[];
  isLearning: boolean;
  lastUpdated: Date | null;
  setCII: (scores: CountryScore[]) => void;
  setFocalPoints: (points: FocalPoint[]) => void;
  setHotspots: (hotspots: Hotspot[]) => void;
  setLearning: (v: boolean) => void;
}

export const useIntelligenceStore = create<IntelligenceStore>((set) => ({
  ciiScores: [],
  focalPoints: [],
  hotspots: [],
  isLearning: false,
  lastUpdated: null,

  setCII: (scores) => set({ ciiScores: scores, lastUpdated: new Date() }),
  setFocalPoints: (points) => set({ focalPoints: points }),
  setHotspots: (hotspots) => set({ hotspots }),
  setLearning: (v) => set({ isLearning: v }),
}));
