"use client";

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
import { LiveIndicator } from "@/components/ui/live-indicator";

export default function DashboardPage() {
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

      <DashboardGrid>
        {/* ── Row 1: News Feed (left) + Live Cams (right) ─── */}
        <PanelSlot>
          <div id="news" className="scroll-mt-16"><NewsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="livecams" className="scroll-mt-16"><LiveCamsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="signals" className="scroll-mt-16"><SignalsPanel /></div>
        </PanelSlot>

        {/* ── Row 2: Intel & Context ──────────────────────── */}
        <PanelSlot>
          <div id="focal" className="scroll-mt-16"><FocalPointsPanel /></div>
        </PanelSlot>
        <PanelSlot span="2">
          <div id="gdelt" className="scroll-mt-16"><GdeltPanel /></div>
        </PanelSlot>

        {/* ── Row 3: Data Panels (working) ────────────────── */}
        <PanelSlot span="2">
          <div id="ucdp" className="scroll-mt-16"><UcdpEventsPanel /></div>
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

        {/* ── Bottom: Inactive / No-Data Panels ───────────── */}
        <PanelSlot>
          <div id="conflicts" className="scroll-mt-16"><ConflictsPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="fires" className="scroll-mt-16"><FiresPanel /></div>
        </PanelSlot>
        <PanelSlot>
          <div id="nuclear" className="scroll-mt-16"><NuclearPanel /></div>
        </PanelSlot>
      </DashboardGrid>
    </>
  );
}

