// Vercel serverless function — faucet endpoint
// POST /api/faucet  { address: "0x..." }
// Transfers 1000 wzkLTC to the requesting address using the faucet wallet.
// FAUCET_PRIVATE_KEY must be set in Vercel environment variables.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC         = "https://liteforge.rpc.caldera.xyz/http";
const WZKLITECOIN = "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec"; // collateral token used by contracts
const AMOUNT      = parseUnits("1000", 8); // 1000 wzkLTC (8 decimals)

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",     type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
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

  const privateKey = process.env.FAUCET_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) return res.status(500).json({ error: "Faucet not configured" });

  const formattedKey = (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`;

  try {
    const account = privateKeyToAccount(formattedKey);
    const pub     = createPublicClient({ transport: http(RPC) });
    const wallet  = createWalletClient({ account, chain, transport: http(RPC) });

    const hash = await wallet.writeContract({
      address: WZKLITECOIN as `0x${string}`,
      abi: ERC20_TRANSFER_ABI,
      functionName: "transfer",
      args: [address as `0x${string}`, AMOUNT],
      gas: BigInt(100_000),
    });

    await pub.waitForTransactionReceipt({ hash });

    return res.status(200).json({ success: true, txHash: hash });
  } catch (e: any) {
    console.error("Faucet error:", e);
    return res.status(500).json({ error: e?.shortMessage || e?.message || "Transfer failed" });
  }
}
