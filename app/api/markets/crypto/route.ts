import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache/redis";
import type { CryptoData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CACHE_KEY = "wv:markets:crypto";
const CACHE_TTL = 180; // 3 minutes

const COINS = ["bitcoin", "ethereum", "solana", "cardano", "ripple"];

interface CoinGeckoResponse {
  id: string;
  name: string;
  symbol: string;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    sparkline_7d?: { price: number[] };
  };
}

async function fetchCrypto(): Promise<{ coins: CryptoData[] }> {
  const coins: CryptoData[] = [];

  for (const id of COINS) {
    try {
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
        {
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        }
      );

      if (!resp.ok) continue;

      const data = (await resp.json()) as CoinGeckoResponse;
      const sparkline = data.market_data.sparkline_7d?.price;

      coins.push({
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        price: data.market_data.current_price.usd,
        change: data.market_data.price_change_percentage_24h,
        sparkline: sparkline ? sparkline.slice(-24).map(Number) : undefined,
      });
    } catch {
      // Skip failed coins
    }
  }

  return { coins };
}

export async function GET() {
  try {
    const data = await cachedFetch(CACHE_KEY, CACHE_TTL, fetchCrypto);
    return NextResponse.json(data ?? { coins: [] });
  } catch (err) {
    console.error("[api/markets/crypto] error:", err);
    return NextResponse.json({ coins: [], error: "Failed to fetch crypto data" }, { status: 500 });
  }
}
