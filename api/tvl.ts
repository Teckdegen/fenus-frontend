// Vercel serverless function — protocol TVL for tokenized RWA assets.
// GET /api/tvl
// For every tokenized stock/ETF/commodity: reads totalSupply() + decimals()
// on-chain (LitVM), fetches its live price from Yahoo Finance, and values
// the minted supply at that price. Sums across all tokens for the TVL.
//
// Token list must stay in sync with the registry in src/pages/Docs.tsx.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPublicClient, http, formatUnits, type Address } from 'viem';

const RPC = 'https://liteforge.rpc.caldera.xyz/http';

const TOKENS: { symbol: string; address: Address }[] = [
  { symbol: 'AAPL',  address: '0x9bEb10a55eA6576F34BE6cEa9dAFdFEfa72aB84c' },
  { symbol: 'MSFT',  address: '0x857595bE1f8aD7599BAB7379ef4880c21c91DFad' },
  { symbol: 'GOOGL', address: '0x03631d2eEb6DD518731B2802a6d4f3D0De57CD66' },
  { symbol: 'AMZN',  address: '0xB950B64DD89B56bF2B5FC43a2C6703fB46F3aa4e' },
  { symbol: 'META',  address: '0xcaaBCc7380936778D0A87E32fD8C8341aA248D87' },
  { symbol: 'NVDA',  address: '0xbd297294820666b391AeDE51248880E31f908170' },
  { symbol: 'TSLA',  address: '0x60Ef1aE026bE8C44e791B31aA0C3be67bE8B72E6' },
  { symbol: 'AMD',   address: '0x1aE03b0C8560c03C50e0d9d8Cfa6737Ab944836b' },
  { symbol: 'INTC',  address: '0x16FAc5F7A3be300986720409aDb8970eC7F975Ff' },
  { symbol: 'MU',    address: '0x5CcB2Df49f8B4958de9884edA2dee3f35F59ce7B' },
  { symbol: 'ORCL',  address: '0x3A114302c954ea5AF9819508db5d0Cf06c65d8Af' },
  { symbol: 'CRWV',  address: '0xF2b4af32A41495eA593C65E0D5A00be93a862fA2' },
  { symbol: 'SNDK',  address: '0x5cC6A6388b1d129774eDd7412cD213e6C720717a' },
  { symbol: 'PLTR',  address: '0xee00fd606521950349568Cb69b849Ae592da3642' },
  { symbol: 'COIN',  address: '0x8e21dcE732A313a6460A1BAb630FB4a306Aa3915' },
  { symbol: 'CRCL',  address: '0x01E164937012DF0ce57DCcA70dC846ee85D66F97' },
  { symbol: 'BABA',  address: '0xb65D951C69a8CC55095749dDb05996D976055F51' },
  { symbol: 'BE',    address: '0xf8d15aB6aeC236511b8D8e704C56923452cb6f84' },
  { symbol: 'SPCX',  address: '0x06Ec44e313F36Bb814B8C10478BCcd6F61D40E02' },
  { symbol: 'USAR',  address: '0xE096C716b00113397A78Ed35cDbF1FB4bDfEF91e' },
  { symbol: 'QQQ',   address: '0xD4C0A6E902158EE7F68b06962653c68283d88dDf' },
  { symbol: 'SPY',   address: '0x4DbEA5D8de706665c5997ef4a6C9033c9e1Fda3D' },
  { symbol: 'SGOV',  address: '0x231ce1B7996846Ffd95981c6cB42cbD987D327B0' },
  { symbol: 'SLV',   address: '0xd58c4f9800D272A1D4B6628C7275266dc226ea36' },
];

const ERC20_ABI = [
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'decimals',    type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const;

const client = createPublicClient({ transport: http(RPC) });

async function fetchSupply(address: Address): Promise<{ totalSupply: bigint; decimals: number }> {
  const [totalSupply, decimals] = await Promise.all([
    client.readContract({ address, abi: ERC20_ABI, functionName: 'totalSupply' }),
    client.readContract({ address, abi: ERC20_ABI, functionName: 'decimals' }),
  ]);
  return { totalSupply, decimals };
}

async function fetchPrice(symbol: string): Promise<number | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const target = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`;
      const r = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fenus-Protocol/1.0)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      return typeof price === 'number' ? price : null;
    } catch {
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
}

type TokenTvl = { symbol: string; totalSupply: number; price: number | null; value: number };

// In-memory cache — persists across warm invocations, avoids re-doing
// ~48 RPC calls + 24 Yahoo lookups on every page load.
let cache: { at: number; data: { tvl: number; updatedAt: number; tokens: TokenTvl[] } } | null = null;
const TTL_MS = 120_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (cache && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(cache.data);
  }

  const tokens: TokenTvl[] = await Promise.all(
    TOKENS.map(async (t): Promise<TokenTvl> => {
      try {
        const [{ totalSupply, decimals }, price] = await Promise.all([
          fetchSupply(t.address),
          fetchPrice(t.symbol),
        ]);
        const supplyNum = Number(formatUnits(totalSupply, decimals));
        const value = price != null ? supplyNum * price : 0;
        return { symbol: t.symbol, totalSupply: supplyNum, price, value };
      } catch (e) {
        console.error(`TVL: failed for ${t.symbol}`, e);
        return { symbol: t.symbol, totalSupply: 0, price: null, value: 0 };
      }
    }),
  );

  const tvl = tokens.reduce((sum, t) => sum + t.value, 0);
  const data = { tvl, updatedAt: Date.now(), tokens };
  cache = { at: Date.now(), data };

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
  return res.status(200).json(data);
}
