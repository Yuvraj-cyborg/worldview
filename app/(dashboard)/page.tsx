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

      {/* Map takes full width */}
      <div className="px-4 md:px-6 pt-4">
        <MapPanel />
      </div>

      <DashboardGrid>
        {/* Row 1: News + Focal Points */}
        <PanelSlot span="2">
          <NewsPanel />
        </PanelSlot>
        <PanelSlot>
          <FocalPointsPanel />
        </PanelSlot>

        {/* Row 2: GDELT Intel + Signals */}
        <PanelSlot span="2">
          <GdeltPanel />
        </PanelSlot>
        <PanelSlot>
          <SignalsPanel />
        </PanelSlot>

        {/* Row 3: Conflicts + UCDP Events */}
        <PanelSlot span="2">
          <ConflictsPanel />
        </PanelSlot>
        <PanelSlot>
          <UcdpEventsPanel />
        </PanelSlot>

        {/* Row 4: CII + Earthquakes + Markets */}
        <PanelSlot span="2">
          <CIIPanel />
        </PanelSlot>
        <PanelSlot>
          <EarthquakesPanel />
        </PanelSlot>

        {/* Row 5: Markets + Fires + Nuclear */}
        <PanelSlot>
          <MarketsPanel />
        </PanelSlot>
        <PanelSlot>
          <FiresPanel />
        </PanelSlot>
        <PanelSlot>
          <NuclearPanel />
        </PanelSlot>

        {/* Row 6: World Clock */}
        <PanelSlot>
          <WorldClockPanel />
        </PanelSlot>
      </DashboardGrid>
    </>
  );
}
