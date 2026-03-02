"use client";

import useSWR from "swr";
import { Panel, PanelSkeleton } from "@/components/ui/panel";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { CryptoData } from "@/lib/types";
import { formatPrice, formatChange } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 20;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={positive ? "var(--positive)" : "var(--negative)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Stock {
  symbol: string;
  display: string;
  price: number | null;
  change: number | null;
}

export function MarketsPanel() {
  const { data: cryptoData, isLoading: cryptoLoading } = useSWR<{ coins: CryptoData[] }>(
    "/api/markets/crypto",
    fetcher,
    { refreshInterval: 120_000 }
  );
  const { data: stockData, isLoading: stockLoading } = useSWR<{ stocks: Stock[] }>(
    "/api/markets/stocks",
    fetcher,
    { refreshInterval: 60_000 }
  );

  const coins = cryptoData?.coins ?? [];
  const stocks = stockData?.stocks ?? [];
  const isLoading = cryptoLoading && stockLoading;

  return (
    <Panel title="Markets" icon={<TrendingUp className="size-4" />} noPadding>
      {isLoading ? (
        <div className="p-4"><PanelSkeleton rows={6} /></div>
      ) : (
        <div>
          {stocks.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Indices & ETFs</span>
              </div>
              <div className="divide-y divide-border/50">
                {stocks.map((s) => {
                  const positive = (s.change ?? 0) >= 0;
                  return (
                    <div key={s.symbol} className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-text-primary">{s.display}</span>
                        <span className="text-[11px] font-mono text-text-muted ml-2">{s.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-data text-text-primary">
                          {s.price ? `$${formatPrice(s.price)}` : "—"}
                        </span>
                        {s.change !== null && (
                          <span className={cn(
                            "text-[11px] font-mono font-data flex items-center gap-0.5",
                            positive ? "text-positive" : "text-negative"
                          )}>
                            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                            {formatChange(s.change)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {coins.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Crypto</span>
              </div>
              <div className="divide-y divide-border/50">
                {coins.map((coin) => {
                  const positive = coin.change >= 0;
                  return (
                    <div key={coin.symbol} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{coin.name}</p>
                        <p className="text-[11px] font-mono text-text-muted">{coin.symbol}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {coin.sparkline && <Sparkline data={coin.sparkline} positive={positive} />}
                        <div className="text-right">
                          <p className="text-sm font-mono font-data font-medium text-text-primary">${formatPrice(coin.price)}</p>
                          <p className={cn(
                            "text-[11px] font-mono font-data flex items-center justify-end gap-0.5",
                            positive ? "text-positive" : "text-negative"
                          )}>
                            {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                            {formatChange(coin.change)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {coins.length === 0 && stocks.length === 0 && (
            <div className="p-4 text-sm text-text-muted">Market data loading...</div>
          )}
        </div>
      )}
    </Panel>
  );
}
