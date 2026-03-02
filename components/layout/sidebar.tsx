"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Newspaper,
  Shield,
  TrendingUp,
  Radio,
  Target,
  BarChart3,
  MessageSquare,
  Activity,
  Crosshair,
  Flame,
  Radiation,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Globe, label: "Overview", href: "/", id: "overview" },
  { icon: Newspaper, label: "News Feed", href: "/#news", id: "news" },
  { icon: Target, label: "Focal Points", href: "/#focal", id: "focal" },
  { icon: Shield, label: "Conflicts", href: "/#conflicts", id: "conflicts" },
  { icon: Crosshair, label: "UCDP Events", href: "/#ucdp", id: "ucdp" },
  { icon: Radio, label: "Signals", href: "/#signals", id: "signals" },
  { icon: BarChart3, label: "CII Index", href: "/#cii", id: "cii" },
  { icon: Activity, label: "Earthquakes", href: "/#quakes", id: "quakes" },
  { icon: TrendingUp, label: "Markets", href: "/#markets", id: "markets" },
  { icon: Flame, label: "Sat. Fires", href: "/#fires", id: "fires" },
  { icon: Radiation, label: "Nuclear", href: "/#nuclear", id: "nuclear" },
  { icon: Clock, label: "World Clock", href: "/#clock", id: "clock" },
  { icon: MessageSquare, label: "Analysis", href: "/analysis", id: "analysis" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [active, setActive] = useState("overview");

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
            WorldView
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

      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
              active === item.id
                ? "bg-wv-accent-muted text-wv-accent font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="py-2 px-2 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Settings className="size-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
