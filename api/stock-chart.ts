// Vercel serverless function — proxies Yahoo Finance chart data server-side.
// GET /api/stock-chart?symbol=AAPL&range=6mo&interval=1d
// Avoids relying on public CORS proxies (Yahoo doesn't send CORS headers for browser fetches).

import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y']);
const ALLOWED_INTERVALS = new Set(['1m', '5m', '15m', '1d', '1wk']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = String(req.query.symbol || '').toUpperCase().trim();
  const range = String(req.query.range || '1mo');
  const interval = String(req.query.interval || '1d');

  if (!/^[A-Z0-9.\-=^]{1,15}$/.test(symbol)) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }
  if (!ALLOWED_RANGES.has(range) || !ALLOWED_INTERVALS.has(interval)) {
    return res.status(400).json({ error: 'Invalid range or interval' });
  }

  try {
    const target = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
    const response = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Fenus-Protocol/1.0)' },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`);
    }

    const data = await response.json();

    // Cache briefly at the edge; client also caches in-memory.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching stock chart:', error);
    return res.status(502).json({
      error: 'Failed to fetch stock data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
