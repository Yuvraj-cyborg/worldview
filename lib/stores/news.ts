import { create } from "zustand";
import type { ClusteredEvent } from "@/lib/types";

type TimeRange = "1h" | "6h" | "24h" | "48h" | "7d" | "all";

interface NewsStore {
  clusters: ClusteredEvent[];
  totalItems: number;
  feedsLoaded: number;
  isLoading: boolean;
  lastUpdated: Date | null;
  timeRange: TimeRange;
  fetchNews: () => Promise<void>;
  setTimeRange: (range: TimeRange) => void;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  clusters: [],
  totalItems: 0,
  feedsLoaded: 0,
  isLoading: false,
  lastUpdated: null,
  timeRange: "24h",

  fetchNews: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const resp = await fetch("/api/news/feeds");
      const data = await resp.json();
      const clusters = (data.clusters ?? []).map((c: Record<string, unknown>) => ({
        ...c,
        firstSeen: new Date(c.firstSeen as string),
        lastUpdated: new Date(c.lastUpdated as string),
      }));
      set({
        clusters,
        totalItems: data.totalItems ?? 0,
        feedsLoaded: data.feedsLoaded ?? 0,
        lastUpdated: new Date(),
      });
    } catch {
      // keep existing data
    } finally {
      set({ isLoading: false });
    }
  },

  setTimeRange: (range) => set({ timeRange: range }),
}));
