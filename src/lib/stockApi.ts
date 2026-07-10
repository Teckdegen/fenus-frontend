// Live stock data via Yahoo Finance chart endpoint (fronted by a CORS proxy).
// Single endpoint returns both current quote + historical closes.

export type Quote = {
  symbol: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  currency: string;
};

export type HistPoint = { date: string; close: number };

const PROXY = "https://corsproxy.io/?url=";

// Map our display symbols to Yahoo symbols (most are 1:1 for US listings).
const yahooSym = (s: string) => s.toUpperCase();

type ChartResp = {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        currency?: string;
      };
      timestamp?: number[];
      indicators: { quote: Array<{ close: (number | null)[] }> };
    }>;
    error?: { description?: string } | null;
  };
};

async function fetchChart(symbol: string, range: string, interval: string): Promise<ChartResp> {
  const y = yahooSym(symbol);
  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${y}?range=${range}&interval=${interval}`;
  const url = PROXY + encodeURIComponent(target);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// tiny in-memory cache to avoid hammering the proxy while scrolling
const quoteCache = new Map<string, { at: number; q: Quote }>();
const histCache = new Map<string, { at: number; h: HistPoint[] }>();
const TTL = 60_000;

export async function fetchQuote(symbol: string): Promise<Quote> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.at < TTL) return cached.q;

  const data = await fetchChart(symbol, "1d", "1m");
  const r = data.chart?.result?.[0];
  if (!r) throw new Error(data.chart?.error?.description || "No data");
  const price = r.meta.regularMarketPrice ?? null;
  const prev = r.meta.chartPreviousClose ?? r.meta.previousClose ?? null;
  const change = price != null && prev != null ? price - prev : null;
  const changePct = price != null && prev ? ((price - prev) / prev) * 100 : null;
  const q: Quote = {
    symbol,
    price,
    change,
    changePct,
    currency: r.meta.currency ?? "USD",
  };
  quoteCache.set(symbol, { at: Date.now(), q });
  return q;
}

export async function fetchHistory(symbol: string, days = 120): Promise<HistPoint[]> {
  const cached = histCache.get(symbol);
  if (cached && Date.now() - cached.at < TTL) return cached.h;

  const range = days <= 30 ? "1mo" : days <= 90 ? "3mo" : days <= 180 ? "6mo" : "1y";
  const data = await fetchChart(symbol, range, "1d");
  const r = data.chart?.result?.[0];
  if (!r || !r.timestamp) throw new Error("No history");
  const closes = r.indicators.quote[0]?.close ?? [];
  const rows: HistPoint[] = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const c = closes[i];
    if (c == null || !isFinite(c)) continue;
    const d = new Date(r.timestamp[i] * 1000);
    rows.push({ date: d.toISOString().slice(0, 10), close: c });
  }
  const h = rows.slice(-days);
  histCache.set(symbol, { at: Date.now(), h });
  return h;
}
