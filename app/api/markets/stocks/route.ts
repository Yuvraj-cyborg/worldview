import { NextResponse } from "next/server";

export const revalidate = 60;

const SYMBOLS = [
  { symbol: "SPY", name: "S&P 500", display: "S&P 500" },
  { symbol: "QQQ", name: "NASDAQ 100", display: "NASDAQ" },
  { symbol: "DIA", name: "Dow Jones", display: "DOW" },
  { symbol: "IWM", name: "Russell 2000", display: "R2000" },
  { symbol: "GLD", name: "Gold ETF", display: "Gold" },
  { symbol: "USO", name: "Oil ETF", display: "Oil" },
];

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ stocks: [], error: "No Finnhub API key" });
  }

  try {
    const results = await Promise.allSettled(
      SYMBOLS.map(async (s) => {
        const resp = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${apiKey}`,
          { signal: AbortSignal.timeout(5000), next: { revalidate: 60 } }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        return {
          symbol: s.symbol,
          name: s.name,
          display: s.display,
          price: data.c ?? null,
          change: data.dp ?? null,
          high: data.h ?? null,
          low: data.l ?? null,
          open: data.o ?? null,
          prevClose: data.pc ?? null,
        };
      })
    );

    const stocks = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);

    return NextResponse.json({ stocks, count: stocks.length });
  } catch (err) {
    console.error("[api/markets/stocks]", err);
    return NextResponse.json({ stocks: [], error: "Failed" }, { status: 500 });
  }
}
