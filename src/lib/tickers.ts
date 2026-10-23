import { TOKEN_REGISTRY } from "@/lib/tokenRegistry";

export type Ticker = {
  symbol: string;
  name: string;
  kind: "stock" | "etf" | "commodity";
  logo: string;
};

// Free CDN for stock/ETF logos — returns transparent PNG for the ticker.
const logo = (sym: string) => `https://financialmodelingprep.com/image-stock/${encodeURIComponent(sym)}.png`;

// Shorter card labels where the docs registry uses the full legal/long name.
const CARD_NAMES: Record<string, string> = {
  GOOGL: "Alphabet",
  PLTR: "Palantir",
  RKLB: "Rocket Lab",
  SGOV: "iShares 0-3M Treasury",
  SPCX: "SpaceX (private)",
  TSM: "TSMC",
};

const bySymbol = (a: { symbol: string }, b: { symbol: string }) => a.symbol.localeCompare(b.symbol);

const toTicker = (t: (typeof TOKEN_REGISTRY)[number]): Ticker => ({
  symbol: t.symbol,
  name: CARD_NAMES[t.symbol] ?? t.name,
  kind: t.kind,
  logo: logo(t.symbol),
});

// Stocks first (A-Z), then ETFs and commodities (A-Z).
export const ALL_TICKERS: Ticker[] = [
  ...TOKEN_REGISTRY.filter((t) => t.kind === "stock").sort(bySymbol).map(toTicker),
  ...TOKEN_REGISTRY.filter((t) => t.kind !== "stock").sort(bySymbol).map(toTicker),
];
