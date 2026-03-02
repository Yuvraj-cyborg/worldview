"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Monitor, Palette, Bell, Database, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { id: "general", label: "General", icon: Monitor },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "data", label: "Data Sources", icon: Database },
  { id: "about", label: "About", icon: Info },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const { theme, setTheme } = useTheme();
  const [refreshInterval, setRefreshInterval] = useState("5");
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative flex items-center justify-center h-full px-4">
        <div
          className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold">Settings</h2>
            <button onClick={onClose} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex min-h-[400px]">
            {/* Sidebar */}
            <div className="w-44 border-r border-border py-2 px-2 space-y-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors",
                    activeTab === tab.id ? "bg-wv-accent-muted text-wv-accent font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {activeTab === "general" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold">General</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Data Refresh Interval</label>
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(e.target.value)}
                        className="mt-1 block w-full bg-muted/50 border border-border rounded-md px-3 py-1.5 text-sm"
                      >
                        <option value="1">1 minute</option>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="30">30 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Default Map View</label>
                      <select className="mt-1 block w-full bg-muted/50 border border-border rounded-md px-3 py-1.5 text-sm">
                        <option value="global">Global</option>
                        <option value="india">India</option>
                        <option value="americas">Americas</option>
                        <option value="europe">Europe</option>
                        <option value="mena">MENA</option>
                        <option value="asia">Asia Pacific</option>
                        <option value="africa">Africa</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold">Appearance</h3>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["dark", "light", "system"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-xs font-medium transition-colors capitalize",
                            theme === t ? "border-wv-accent bg-wv-accent-muted text-wv-accent" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold">Alert Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-xs">Enable Threat Alerts</span>
                      <button
                        onClick={() => setAlertsEnabled(!alertsEnabled)}
                        className={cn(
                          "relative w-9 h-5 rounded-full transition-colors",
                          alertsEnabled ? "bg-wv-accent" : "bg-muted"
                        )}
                      >
                        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-transform", alertsEnabled ? "left-[18px]" : "left-0.5")} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-xs">Earthquake Alerts (M5+)</span>
                      <button className="relative w-9 h-5 rounded-full bg-wv-accent transition-colors">
                        <span className="absolute top-0.5 left-[18px] size-4 rounded-full bg-white" />
                      </button>
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-xs">Conflict Escalation Alerts</span>
                      <button className="relative w-9 h-5 rounded-full bg-wv-accent transition-colors">
                        <span className="absolute top-0.5 left-[18px] size-4 rounded-full bg-white" />
                      </button>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold">Data Sources</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: "RSS News Feeds", count: "198 sources", status: "active" },
                      { name: "USGS Earthquakes", count: "Real-time", status: "active" },
                      { name: "UCDP Conflict Data", count: "Historical + Live", status: "active" },
                      { name: "GDELT Project", count: "With Google News fallback", status: "active" },
                      { name: "NASA FIRMS", count: "Satellite fires", status: process.env.NEXT_PUBLIC_NASA_FIRMS_KEY ? "active" : "needs key" },
                      { name: "CoinGecko", count: "Crypto markets", status: "active" },
                      { name: "Finnhub", count: "Stock markets", status: process.env.NEXT_PUBLIC_FINNHUB_KEY ? "active" : "needs key" },
                      { name: "ACLED", count: "Armed conflict data", status: "connected" },
                    ].map((src) => (
                      <div key={src.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <span className="font-medium">{src.name}</span>
                          <span className="text-muted-foreground ml-2">{src.count}</span>
                        </div>
                        <span className={cn("text-[10px] font-mono uppercase", src.status === "active" ? "text-green-400" : "text-yellow-400")}>
                          {src.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold">About GeoTrack</h3>
                  <div className="space-y-3 text-xs text-muted-foreground">
                    <p>GeoTrack v1.0 — Global Intelligence Dashboard</p>
                    <p>Real-time monitoring of geopolitical events, conflicts, natural disasters, markets, and global infrastructure.</p>
                    <div className="pt-3 border-t border-border space-y-1.5">
                      <p>198 news sources across 15 categories</p>
                      <p>227 military bases, 123 nuclear facilities</p>
                      <p>88 pipelines, 18 subsea cables, 41 economic centers</p>
                      <p>8 active conflict zones, 28+ intel hotspots</p>
                    </div>
                    <p className="pt-3 border-t border-border text-[10px]">Built with Next.js, deck.gl, MapLibre GL, and React.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
