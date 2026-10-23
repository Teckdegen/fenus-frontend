// GET /api/tvl — protocol TVL for every FENUS tokenized asset.
// Reads totalSupply() + decimals() for each token in one Multicall3 request on
// LitVM, prices the tokens that have supply with Yahoo Finance, and values the
// minted supply at that price. Sum = TVL.

import { cacheLife } from "next/cache";
import { createPublicClient, decodeFunctionResult, encodeFunctionData, formatUnits, http, type Address } from "viem";
import { TOKEN_REGISTRY } from "../../lib/tokenRegistry";

const RPC = "https://liteforge.rpc.caldera.xyz/http";
const MULTICALL3: Address = "0xcA11bde05977b3631167028862bE2a173976CA11";

const ERC20_ABI = [
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;

// aggregate3 is declared "view" so it can be eth_call-ed through readContract.
const MULTICALL_ABI = [
  {
    name: "aggregate3",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
      },
    ],
    outputs: [
      {
        name: "returnData",
        type: "tuple[]",
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
      },
    ],
  },
] as const;

const SUPPLY_CALL = encodeFunctionData({ abi: ERC20_ABI, functionName: "totalSupply" });
const DECIMALS_CALL = encodeFunctionData({ abi: ERC20_ABI, functionName: "decimals" });

const client = createPublicClient({ transport: http(RPC) });

type TokenTvl = { symbol: string; totalSupply: number; price: number | null; value: number };
type TvlData = { tvl: number; updatedAt: number; tokenCount: number; missingPrices: string[]; tokens: TokenTvl[] };

async function fetchSupplies(): Promise<(number | null)[]> {
  const calls = TOKEN_REGISTRY.flatMap((t) => [
    { target: t.address as Address, allowFailure: true, callData: SUPPLY_CALL },
    { target: t.address as Address, allowFailure: true, callData: DECIMALS_CALL },
  ]);
  const results = await client.readContract({
    address: MULTICALL3,
    abi: MULTICALL_ABI,
    functionName: "aggregate3",
    args: [calls],
  });
  return TOKEN_REGISTRY.map((_, i) => {
    const supply = results[i * 2];
    const decimals = results[i * 2 + 1];
    if (!supply.success || !decimals.success) return null;
    try {
      const raw = decodeFunctionResult({ abi: ERC20_ABI, functionName: "totalSupply", data: supply.returnData });
      const dec = decodeFunctionResult({ abi: ERC20_ABI, functionName: "decimals", data: decimals.returnData });
      return Number(formatUnits(raw, dec));
    } catch {
      return null;
    }
  });
}

async function fetchPrice(symbol: string): Promise<number | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Fenus-Protocol/1.0)" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      return typeof price === "number" ? price : null;
    } catch {
      if (attempt === 2) return null;
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
  return null;
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// Last good price per symbol, so one failed Yahoo lookup doesn't drop a token's
// value out of the total.
const lastPrice = new Map<string, number>();

async function computeTvl(): Promise<TvlData> {
  "use cache";
  cacheLife("minutes");

  const supplies = await fetchSupplies();

  // Only tokens with minted supply contribute value, so only price those.
  const live = TOKEN_REGISTRY.map((t, i) => ({ symbol: t.symbol, totalSupply: supplies[i] ?? 0 })).filter((t) => t.totalSupply > 0);

  const prices = await pool(live, 10, async (t) => {
    const p = await fetchPrice(t.symbol);
    if (p != null) lastPrice.set(t.symbol, p);
    return p ?? lastPrice.get(t.symbol) ?? null;
  });

  const tokens: TokenTvl[] = live.map((t, i) => ({
    symbol: t.symbol,
    totalSupply: t.totalSupply,
    price: prices[i],
    value: prices[i] != null ? t.totalSupply * (prices[i] as number) : 0,
  }));

  return {
    tvl: tokens.reduce((sum, t) => sum + t.value, 0),
    updatedAt: Date.now(),
    tokenCount: TOKEN_REGISTRY.length,
    missingPrices: tokens.filter((t) => t.price == null).map((t) => t.symbol),
    tokens,
  };
}

export async function GET() {
  try {
    return Response.json(await computeTvl(), {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    console.error("TVL: failed", e);
    return Response.json({ error: "Failed to compute TVL" }, { status: 502 });
  }
}
