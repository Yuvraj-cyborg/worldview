export function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wv-accent opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-wv-accent" />
      </span>
      <span className="text-[11px] font-medium text-wv-accent">LIVE</span>
    </div>
  );
}
