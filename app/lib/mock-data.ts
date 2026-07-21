export type Asset = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  logoUrl: string;
  color: string; // accent color for chart
  up: boolean;
};

export const ASSETS: Asset[] = [
  { ticker: "AAPL", name: "Apple Inc.", price: 214.29, change: 3.45, changePct: 1.64, volume: "24M", logoUrl: "https://logo.clearbit.com/apple.com", color: "#22c55e", up: true },
  { ticker: "TSLA", name: "Tesla Inc.", price: 248.50, change: -4.21, changePct: -1.66, volume: "24M", logoUrl: "https://logo.clearbit.com/tesla.com", color: "#ef4444", up: false },
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 138.85, change: 2.14, changePct: 1.56, volume: "24M", logoUrl: "https://logo.clearbit.com/nvidia.com", color: "#22c55e", up: true },
  { ticker: "MSFT", name: "Microsoft Corp.", price: 510.12, change: 1.88, changePct: 0.37, volume: "24M", logoUrl: "https://logo.clearbit.com/microsoft.com", color: "#22c55e", up: true },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 196.47, change: -0.92, changePct: -0.47, volume: "24M", logoUrl: "https://logo.clearbit.com/google.com", color: "#ef4444", up: false },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 228.73, change: 3.10, changePct: 1.37, volume: "24M", logoUrl: "https://logo.clearbit.com/amazon.com", color: "#22c55e", up: true },
  { ticker: "META", name: "Meta Platforms", price: 708.91, change: 8.20, changePct: 1.17, volume: "24M", logoUrl: "https://logo.clearbit.com/meta.com", color: "#22c55e", up: true },
  { ticker: "COIN", name: "Coinbase Global", price: 312.40, change: -6.55, changePct: -2.05, volume: "24M", logoUrl: "https://logo.clearbit.com/coinbase.com", color: "#ef4444", up: false },
  { ticker: "NFLX", name: "Netflix Inc.", price: 1302.66, change: 15.22, changePct: 1.18, volume: "24M", logoUrl: "https://logo.clearbit.com/netflix.com", color: "#22c55e", up: true },
  { ticker: "AMD", name: "Advanced Micro Devices", price: 168.34, change: -2.40, changePct: -1.41, volume: "24M", logoUrl: "https://logo.clearbit.com/amd.com", color: "#ef4444", up: false },
  { ticker: "UBER", name: "Uber Technologies", price: 88.14, change: 0.74, changePct: 0.85, volume: "24M", logoUrl: "https://logo.clearbit.com/uber.com", color: "#22c55e", up: true },
  { ticker: "PLTR", name: "Palantir Technologies", price: 142.55, change: 4.33, changePct: 3.13, volume: "24M", logoUrl: "https://logo.clearbit.com/palantir.com", color: "#22c55e", up: true },
  { ticker: "SPY", name: "SPDR S&P 500 ETF", price: 612.34, change: 1.22, changePct: 0.20, volume: "24M", logoUrl: "https://logo.clearbit.com/ssga.com", color: "#22c55e", up: true },
  { ticker: "QQQ", name: "Invesco QQQ Trust", price: 540.77, change: -1.88, changePct: -0.35, volume: "24M", logoUrl: "https://logo.clearbit.com/invesco.com", color: "#ef4444", up: false },
  { ticker: "GLD", name: "SPDR Gold Shares", price: 312.85, change: 2.10, changePct: 0.68, volume: "24M", logoUrl: "https://logo.clearbit.com/spdrgoldshares.com", color: "#22c55e", up: true },
  { ticker: "SHOP", name: "Shopify Inc.", price: 118.42, change: -1.30, changePct: -1.09, volume: "24M", logoUrl: "https://logo.clearbit.com/shopify.com", color: "#ef4444", up: false },
];

// Generate mock sparkline data
function genSparkline(up: boolean, points = 24) {
  const data = [];
  let val = 100 + Math.random() * 20;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - (up ? 0.42 : 0.58)) * 3;
    data.push({ v: Math.max(80, val) });
  }
  return data;
}

export function getSparkline(ticker: string) {
  const asset = ASSETS.find((a) => a.ticker === ticker);
  return genSparkline(asset?.up ?? true);
}

// Generate detailed chart data for asset page
export function getChartData(range: string, up: boolean) {
  const points = range === "1D" ? 48 : range === "1W" ? 56 : range === "1M" ? 60 : range === "3M" ? 90 : range === "1Y" ? 120 : 180;
  const data = [];
  let val = 180 + Math.random() * 40;
  const now = Date.now();
  const step =
    range === "1D" ? 30 * 60 * 1000 :
    range === "1W" ? 3 * 60 * 60 * 1000 :
    range === "1M" ? 12 * 60 * 60 * 1000 :
    24 * 60 * 60 * 1000;

  for (let i = 0; i < points; i++) {
    val += (Math.random() - (up ? 0.44 : 0.56)) * 4;
    val = Math.max(80, val);
    const ts = now - (points - i) * step;
    const d = new Date(ts);
    const label =
      range === "1D"
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString([], { month: "short", day: "numeric" });
    data.push({ time: label, price: Math.round(val * 100) / 100 });
  }
  return data;
}

// Portfolio mock
export const PORTFOLIO_HOLDINGS = [
  { ticker: "AAPL", name: "Apple Inc.", logoUrl: "https://logo.clearbit.com/apple.com", balance: 12.5, price: 214.29, value: 2678.62, pct: 35.2 },
  { ticker: "TSLA", name: "Tesla Inc.", logoUrl: "https://logo.clearbit.com/tesla.com", balance: 8.0, price: 248.50, value: 1988.00, pct: 26.1 },
  { ticker: "NVDA", name: "NVIDIA Corp.", logoUrl: "https://logo.clearbit.com/nvidia.com", balance: 10.0, price: 138.85, value: 1388.50, pct: 18.2 },
  { ticker: "SPY", name: "SPDR S&P 500 ETF", logoUrl: "https://logo.clearbit.com/ssga.com", balance: 3.0, price: 612.34, value: 1837.02, pct: 20.5 },
];

export const TOTAL_PORTFOLIO_VALUE = PORTFOLIO_HOLDINGS.reduce((s, h) => s + h.value, 0);

export const TRANSACTIONS = [
  { date: "Jul 8, 2026", time: "03:12 PM GMT", type: "Buy", ticker: "AAPL", amount: "+2.5", value: "$535.73", status: "Completed" },
  { date: "Jul 7, 2026", time: "11:44 AM GMT", type: "Sell", ticker: "TSLA", amount: "-1.0", value: "$248.50", status: "Completed" },
  { date: "Jul 6, 2026", time: "02:30 PM GMT", type: "Loan", ticker: "NVDA", amount: "10.0", value: "$800.00", status: "Active" },
  { date: "Jul 5, 2026", time: "09:15 AM GMT", type: "Buy", ticker: "SPY", amount: "+1.0", value: "$612.34", status: "Completed" },
  { date: "Jul 3, 2026", time: "04:50 PM GMT", type: "Sell", ticker: "AAPL", amount: "-3.0", value: "$634.20", status: "Completed" },
  { date: "Jul 2, 2026", time: "01:22 PM GMT", type: "Buy", ticker: "TSLA", amount: "+4.0", value: "$994.00", status: "Completed" },
];
