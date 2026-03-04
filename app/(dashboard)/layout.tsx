"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/ui/command-palette";
import { CountryModal } from "@/components/modals/country-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import { useIntelNotifications } from "@/hooks/use-intel-notifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  useIntelNotifications(); // Push notify on critical AI intel events

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleCountrySelect = useCallback((name: string) => {
    setSelectedCountry(name);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSearch={() => setSearchOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
      <MobileNav />
      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onCountrySelect={handleCountrySelect}
      />
      <CountryModal
        countryName={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
