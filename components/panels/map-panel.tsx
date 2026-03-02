"use client";

import dynamic from "next/dynamic";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { Globe } from "lucide-react";

const WorldMap = dynamic(
  () => import("@/components/map/world-map").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[55vh] flex items-center justify-center bg-surface-0 rounded-xl">
        <PanelSkeleton rows={4} />
      </div>
    ),
  }
);

export function MapPanel() {
  return (
    <Panel
      title="Global Situation Map"
      icon={<Globe className="size-4" />}
      noPadding
    >
      <div className="h-[55vh] min-h-[400px]">
        <WorldMap />
      </div>
    </Panel>
  );
}
