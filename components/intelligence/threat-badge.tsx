import { cn } from "@/lib/utils";
import type { ThreatLevel } from "@/lib/types";

const THREAT_STYLES: Record<ThreatLevel, string> = {
  critical: "bg-threat-critical/15 text-threat-critical border-threat-critical/20",
  high: "bg-threat-high/15 text-threat-high border-threat-high/20",
  medium: "bg-threat-medium/15 text-threat-medium border-threat-medium/20",
  low: "bg-threat-low/15 text-threat-low border-threat-low/20",
  info: "bg-threat-info/15 text-threat-info border-threat-info/20",
};

const THREAT_LABELS: Record<ThreatLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

interface ThreatBadgeProps {
  level: ThreatLevel;
  className?: string;
  compact?: boolean;
}

export function ThreatBadge({ level, className, compact }: ThreatBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        compact ? "text-[9px] px-1.5 py-0" : "text-[11px] px-2 py-0.5",
        THREAT_STYLES[level],
        className
      )}
    >
      {THREAT_LABELS[level]}
    </span>
  );
}
