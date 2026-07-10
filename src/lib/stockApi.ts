// Free stock data via Stooq (CORS-friendly, no API key).
// Docs (unofficial): https://stooq.com/q/l/  and https://stooq.com/q/d/l/

export type Quote = {
  symbol: string;
  price: number | null;
  change: number | null;      // absolute
  changePct: number | null;   // percent
  currency: string;
};

export type HistPoint = { date: string; close: number };

const stooqSym = (s: string) => `${s.toLowerCase()}.us`;

export async function fetchQuote(symbol: string): Promise<Quote> {
  const url = `https://stooq.com/q/l/?s=${stooqSym(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  // Symbol,Date,Time,Open,High,Low,Close,Volume
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("No data");
  const cols = lines[1].split(",");
  const open = parseFloat(cols[3]);
  const close = parseFloat(cols[6]);
  if (!isFinite(close)) throw new Error("No price");
  const change = isFinite(open) ? close - open : null;
  const changePct = isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : null;
  return { symbol, price: close, change, changePct, currency: "USD" };
}

export async function fetchHistory(symbol: string, days = 120): Promise<HistPoint[]> {
  const url = `https://stooq.com/q/d/l/?s=${stooqSym(symbol)}&i=d`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("No history");
  // Date,Open,High,Low,Close,Volume
  const rows = lines.slice(1).map((l) => {
    const c = l.split(",");
    return { date: c[0], close: parseFloat(c[4]) };
  }).filter((r) => isFinite(r.close));
  return rows.slice(-days);
}
