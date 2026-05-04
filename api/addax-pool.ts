import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const poolAddress = req.query.address || '0xa299a878b7b696d966b3b69e7e3ed7bd4a050b26';

  try {
    const response = await fetch(
      `https://addax.finance/api/pools/${poolAddress}`,
      {
        headers: {
          'User-Agent': 'Fenus-Protocol/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Addax API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Cache for 30 seconds
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Addax:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch pool data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
