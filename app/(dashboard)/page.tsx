"use client";

import { useState } from "react";
import { DashboardGrid, PanelSlot } from "@/components/layout/dashboard-grid";
import { NewsPanel } from "@/components/panels/news-panel";
import { CIIPanel } from "@/components/panels/cii-panel";
import { SignalsPanel } from "@/components/panels/signals-panel";
import { FocalPointsPanel } from "@/components/panels/focal-points-panel";
import { MarketsPanel } from "@/components/panels/markets-panel";
import { ConflictsPanel } from "@/components/panels/conflicts-panel";
import { EarthquakesPanel } from "@/components/panels/earthquakes-panel";
import { MapPanel } from "@/components/panels/map-panel";
import { GdeltPanel } from "@/components/panels/gdelt-panel";
import { UcdpEventsPanel } from "@/components/panels/ucdp-events-panel";
import { FiresPanel } from "@/components/panels/fires-panel";
import { NuclearPanel } from "@/components/panels/nuclear-panel";
import { WorldClockPanel } from "@/components/panels/world-clock-panel";
import { LiveCamsPanel } from "@/components/panels/live-cams-panel";
import { LiveTvPanel } from "@/components/panels/live-tv-panel";
import { IntelBriefPanel } from "@/components/panels/intel-brief-panel";
import { LiveIndicator } from "@/components/ui/live-indicator";

export default function DashboardPage() {
  const [tvHeight, setTvHeight] = useState<number>(0);

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <LiveIndicator />
        </div>
        <p className="text-[11px] font-mono text-text-muted font-data hidden sm:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div id="map" className="px-4 md:px-6 pt-4 scroll-mt-16">
        <MapPanel />
      </div>

      {/* ── ROW 1: News Feed + Live Cams ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:px-6 items-start">
        <div id="news" className="scroll-mt-16"><NewsPanel /></div>
        <div id="livecams" className="scroll-mt-16"><LiveCamsPanel /></div>
      </div>

      {/* ── ROW 2: Live TV + AI Intel Brief (same height) ────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6 pb-4 items-start">
        <div id="livetv" className="scroll-mt-16">
          <LiveTvPanel onHeightMeasured={setTvHeight} />
        </div>
        <div
          id="intel-brief"
          className="scroll-mt-16 overflow-y-auto"
          style={tvHeight ? { maxHeight: `${tvHeight}px` } : undefined}
        >
          <IntelBriefPanel />
        </div>
      </div>

      {/* ── REST: 3-column grid ───────────────────────────────── */}
      <DashboardGrid>
        <PanelSlot>
          <div id="focal" className="scroll-mt-16"><FocalPointsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="gdelt" className="scroll-mt-16"><GdeltPanel /></div>
        </PanelSlot>

        <PanelSlot>
          <div id="cii" className="scroll-mt-16"><CIIPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="quakes" className="scroll-mt-16"><EarthquakesPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="markets" className="scroll-mt-16"><MarketsPanel /></div>
        </PanelSlot>

        <PanelSlot>
          <div id="clock" className="scroll-mt-16"><WorldClockPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="nuclear" className="scroll-mt-16"><NuclearPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="conflicts" className="scroll-mt-16"><ConflictsPanel /></div>
        </PanelSlot>

        {/* ── Bottom: inactive/slow panels ─────────────────────── */}
        <PanelSlot>
          <div id="signals" className="scroll-mt-16"><SignalsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="ucdp" className="scroll-mt-16"><UcdpEventsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="fires" className="scroll-mt-16"><FiresPanel /></div>
        </PanelSlot>
      </DashboardGrid>
    </>
  );
}
