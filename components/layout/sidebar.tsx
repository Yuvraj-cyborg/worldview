"use client";

import { useState } from "react";
import {
  Globe, Newspaper, Shield, TrendingUp, Radio, Target, BarChart3,
  Activity, Crosshair, Flame, Radiation, Clock, Settings,
  ChevronLeft, ChevronRight, Camera, Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  sectionId: string;
  id: string;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Globe, label: "Overview", sectionId: "map", id: "overview" },
  { icon: Newspaper, label: "News Feed", sectionId: "news", id: "news" },
  { icon: Target, label: "Focal Points", sectionId: "focal", id: "focal" },
  { icon: Shield, label: "Conflicts", sectionId: "conflicts", id: "conflicts" },
  { icon: Crosshair, label: "UCDP Events", sectionId: "ucdp", id: "ucdp" },
  { icon: Radio, label: "Signals", sectionId: "signals", id: "signals" },
  { icon: BarChart3, label: "CII Index", sectionId: "cii", id: "cii" },
  { icon: Activity, label: "Earthquakes", sectionId: "quakes", id: "quakes" },
  { icon: TrendingUp, label: "Markets", sectionId: "markets", id: "markets" },
  { icon: Flame, label: "Sat. Fires", sectionId: "fires", id: "fires" },
  { icon: Radiation, label: "Nuclear", sectionId: "nuclear", id: "nuclear" },
  { icon: Clock, label: "World Clock", sectionId: "clock", id: "clock" },
  { icon: Camera, label: "Live Cams", sectionId: "livecams", id: "livecams" },
  { icon: Tv, label: "Channels", sectionId: "channels", id: "channels", href: "/channels" },
];

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState("overview");

  const handleNav = (item: NavItem) => {
    setActive(item.id);
    if (item.href) {
      window.location.href = item.href;
      return;
    }
    if (item.id === "overview") {
      window.location.href = "/";
      return;
    }
    const el = document.getElementById(item.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 z-40 border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex items-center h-14 px-3 border-b border-border">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground truncate ml-1">
            GeoTrack
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            className={cn(
              "w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
              active === item.id
                ? "bg-wv-accent-muted text-wv-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="py-2 px-2 border-t border-border">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
