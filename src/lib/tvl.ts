// Client for /api/tvl — protocol TVL across all tokenized RWA assets.

export type TvlToken = { symbol: string; totalSupply: number; price: number | null; value: number };
export type TvlResponse = { tvl: number; updatedAt: number; tokens: TvlToken[] };

let cache: { at: number; data: TvlResponse } | null = null;
const TTL = 60_000;

export async function fetchTVL(): Promise<TvlResponse> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const res = await fetch("/api/tvl", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: TvlResponse = await res.json();
  cache = { at: Date.now(), data };
  return data;
}

export const fmtUsdCompact = (n: number): string => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};
