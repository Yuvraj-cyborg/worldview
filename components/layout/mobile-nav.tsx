"use client";

import Link from "next/link";
import { Globe, Newspaper, BarChart3, Radio, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: Globe, label: "Home", href: "/", id: "home" },
  { icon: Newspaper, label: "News", href: "/#news", id: "news" },
  { icon: BarChart3, label: "CII", href: "/#cii", id: "cii" },
  { icon: Radio, label: "Signals", href: "/#signals", id: "signals" },
  { icon: Search, label: "Search", href: "#search", id: "search" },
];

export function MobileNav() {
  const [active, setActive] = useState("home");

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] transition-colors",
              active === item.id
                ? "text-wv-accent"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
