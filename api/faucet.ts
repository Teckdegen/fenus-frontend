// Vercel serverless function — faucet endpoint
// POST /api/faucet  { address: "0x..." }
// Mints 1000 WzkLTC to the requesting address using the admin wallet.
// FAUCET_PRIVATE_KEY must be set in Vercel environment variables.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC           = "https://liteforge.rpc.caldera.xyz/http";
const WZKLITECOIN   = "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec";
const AMOUNT        = parseUnits("1000", 8); // 1000 WzkLTC (8 decimals)
const COOLDOWN_MS   = 48 * 60 * 60 * 1000;

// In-memory cooldown store (resets on cold start — use KV store for production)
const cooldowns = new Map<string, number>();

const ADMIN_MINT_ABI = [
  { name: "adminMint", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [] },
] as const;

const chain = {
  id: 4441,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLitecoin", symbol: "zkLTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { address } = req.body || {};
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  const key = address.toLowerCase();

  // Check cooldown
  const last = cooldowns.get(key) || 0;
  const elapsed = Date.now() - last;
  if (elapsed < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 3600000);
    return res.status(429).json({ error: `Cooldown active. Try again in ${remaining}h` });
  }

  const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) return res.status(500).json({ error: "Faucet not configured" });

  try {
    const account = privateKeyToAccount(privateKey);
    const pub     = createPublicClient({ transport: http(RPC) });
    const wallet  = createWalletClient({ account, chain, transport: http(RPC) });

    const hash = await wallet.writeContract({
      address: WZKLITECOIN as `0x${string}`,
      abi: ADMIN_MINT_ABI,
      functionName: "adminMint",
      args: [address as `0x${string}`, AMOUNT],
      gas: BigInt(200_000),
    });

    await pub.waitForTransactionReceipt({ hash });
    cooldowns.set(key, Date.now());

    return res.status(200).json({ success: true, txHash: hash });
  } catch (e: any) {
    return res.status(500).json({ error: e?.shortMessage || e?.message || "Mint failed" });
  }
}
