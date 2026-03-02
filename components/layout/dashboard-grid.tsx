import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 p-4 md:p-6 items-start",
        "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PanelSlotProps {
  children: React.ReactNode;
  span?: "full" | "2" | "1";
  className?: string;
}

export function PanelSlot({ children, span = "1", className }: PanelSlotProps) {
  return (
    <div
      className={cn(
        span === "full" && "col-span-full",
        span === "2" && "md:col-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
