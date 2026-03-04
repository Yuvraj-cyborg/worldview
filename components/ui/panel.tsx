import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  timestamp?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function Panel({
  title,
  timestamp,
  icon,
  children,
  className,
  contentClassName,
  contentStyle,
  action,
  noPadding,
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {timestamp && (
            <span className="text-[11px] font-mono text-text-muted font-data">
              {timestamp}
            </span>
          )}
        </div>
      </div>
      <div className={cn("max-h-[420px] overflow-y-auto", contentClassName, !noPadding && "p-4")} style={contentStyle}>{children}</div>
    </div>
  );
}

const SKELETON_WIDTHS = [72, 88, 64, 80, 68, 84, 76, 92];

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="h-3 rounded bg-muted animate-pulse"
            style={{ width: `${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}%` }}
          />
        </div>
      ))}
    </div>
  );
}
