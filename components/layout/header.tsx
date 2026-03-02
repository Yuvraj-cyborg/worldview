"use client";

import { useTheme } from "next-themes";
import { Search, Bell, Sun, Moon, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

export function Header({ onOpenSearch, onOpenSettings }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 md:hidden">
            <Globe className="size-5 text-wv-accent" />
            <span className="text-sm font-semibold tracking-tight">GeoTrack</span>
          </a>
          <a href="/" className="hidden md:flex items-center gap-2">
            <Globe className="size-5 text-wv-accent" />
            <span className="text-sm font-semibold tracking-tight">GeoTrack</span>
            <span className="text-[11px] font-mono text-muted-foreground ml-1">v1.0</span>
          </a>
        </div>

        <button
          onClick={onOpenSearch}
          className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg",
            "bg-muted/50 border border-border text-muted-foreground text-sm",
            "hover:bg-muted hover:text-foreground transition-colors",
            "w-64 lg:w-80"
          )}
        >
          <Search className="size-3.5" />
          <span className="text-xs">Search signals, countries, events...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <button
            className="relative size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Alerts"
          >
            <Bell className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-threat-critical text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="size-4 hidden dark:block" />
            <Moon className="size-4 block dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
