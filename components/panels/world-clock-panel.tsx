"use client";

import { Panel } from "@/components/ui/panel";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const CITIES = [
  { label: "New York", tz: "America/New_York", flag: "🇺🇸", utc: "UTC-5" },
  { label: "London", tz: "Europe/London", flag: "🇬🇧", utc: "UTC+0" },
  { label: "Berlin", tz: "Europe/Berlin", flag: "🇩🇪", utc: "UTC+1" },
  { label: "Moscow", tz: "Europe/Moscow", flag: "🇷🇺", utc: "UTC+3" },
  { label: "Dubai", tz: "Asia/Dubai", flag: "🇦🇪", utc: "UTC+4" },
  { label: "Mumbai", tz: "Asia/Kolkata", flag: "🇮🇳", utc: "UTC+5:30" },
  { label: "Beijing", tz: "Asia/Shanghai", flag: "🇨🇳", utc: "UTC+8" },
  { label: "Tokyo", tz: "Asia/Tokyo", flag: "🇯🇵", utc: "UTC+9" },
  { label: "Sydney", tz: "Australia/Sydney", flag: "🇦🇺", utc: "UTC+11" },
  { label: "Tel Aviv", tz: "Asia/Jerusalem", flag: "🇮🇱", utc: "UTC+2" },
  { label: "Kyiv", tz: "Europe/Kyiv", flag: "🇺🇦", utc: "UTC+2" },
  { label: "Taipei", tz: "Asia/Taipei", flag: "🇹🇼", utc: "UTC+8" },
];

function formatTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return "--:--:--";
  }
}

function getHour(tz: string): number {
  try {
    return parseInt(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
      }).format(new Date())
    );
  } catch {
    return 12;
  }
}

export function WorldClockPanel() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    function tick() {
      const t: Record<string, string> = {};
      for (const c of CITIES) t[c.tz] = formatTime(c.tz);
      setTimes(t);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const hasTimes = Object.keys(times).length > 0;

  return (
    <Panel title="World Clock" icon={<Clock className="size-4" />} noPadding>
      <div className="divide-y divide-border/50">
        {CITIES.map((c) => {
          const hour = hasTimes ? getHour(c.tz) : 12;
          const daytime = hour >= 6 && hour < 18;
          return (
            <div
              key={c.tz}
              className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{c.flag}</span>
                <div>
                  <span className="text-sm font-medium text-text-primary">{c.label}</span>
                  <span className="text-[10px] font-mono text-text-muted ml-2">{c.utc}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasTimes && <span className="text-[10px]">{daytime ? "☀" : "🌙"}</span>}
                <span className="text-sm font-mono font-data text-text-primary tabular-nums">
                  {times[c.tz] ?? "--:--:--"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
