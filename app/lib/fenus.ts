import { TOKEN_REGISTRY } from "./tokenRegistry";

export const APP_URL = "https://app.fenus.xyz";
export const X_URL = "https://x.com/fenus_protocol";
export const TVL_URL = "https://www.fenus.xyz/api/tvl";
export const EXPLORER = "https://liteforge.explorer.caldera.xyz";

// Free CDN for stock and ETF logos, keyed by ticker.
export const stockLogo = (symbol: string) =>
  `https://financialmodelingprep.com/image-stock/${encodeURIComponent(symbol)}.png`;

// The 30 largest companies FENUS tokenizes, by market cap.
const TOP = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "AVGO", "TSLA", "TSM", "LLY",
  "ORCL", "NFLX", "COST", "JNJ", "XOM", "UNH", "PLTR", "AMD", "ASML", "BABA",
  "IBM", "CSCO", "CRM", "GE", "MU", "QCOM", "ADBE", "SHOP", "INTC", "COIN",
];

const SHORT_NAMES: Record<string, string> = {
  GOOGL: "Alphabet",
  META: "Meta",
  TSM: "TSMC",
  LLY: "Eli Lilly",
  PLTR: "Palantir",
  AMD: "AMD",
  ASML: "ASML",
  JNJ: "J&J",
  XOM: "Exxon",
  UNH: "UnitedHealth",
  CRM: "Salesforce",
  GE: "GE Aerospace",
  MU: "Micron",
};

export const TOP_STOCKS = TOP.map((symbol) => {
  const token = TOKEN_REGISTRY.find((t) => t.symbol === symbol);
  return { symbol, name: SHORT_NAMES[symbol] ?? token?.name ?? symbol, logo: stockLogo(symbol) };
});

export const COUNTS = {
  all: TOKEN_REGISTRY.length,
  stock: TOKEN_REGISTRY.filter((t) => t.kind === "stock").length,
  etf: TOKEN_REGISTRY.filter((t) => t.kind === "etf").length,
  commodity: TOKEN_REGISTRY.filter((t) => t.kind === "commodity").length,
};
