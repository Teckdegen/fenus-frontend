// useTroveActions — all on-chain Trove operations wired to BorrowerOperations.

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseUnits, maxUint256, createPublicClient, http } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const BO_ABI = [
  { name: "openTrove",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "collAmount", type: "uint256" }, { name: "fnUSDAmount6", type: "uint256" },
             { name: "upperHint", type: "address" }, { name: "lowerHint", type: "address" }],
    outputs: [] },
  { name: "addColl",       type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "collAmount", type: "uint256" }, { name: "upperHint", type: "address" },
             { name: "lowerHint", type: "address" }], outputs: [] },
  { name: "withdrawColl",  type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "collAmount", type: "uint256" }, { name: "upperHint", type: "address" },
             { name: "lowerHint", type: "address" }], outputs: [] },
  { name: "withdrawFnUSD", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "fnUSDAmount6", type: "uint256" }, { name: "upperHint", type: "address" },
             { name: "lowerHint", type: "address" }], outputs: [] },
  { name: "repayFnUSD",    type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "fnUSDAmount6", type: "uint256" }, { name: "upperHint", type: "address" },
             { name: "lowerHint", type: "address" }], outputs: [] },
  { name: "closeTrove",    type: "function", stateMutability: "nonpayable",
    inputs: [], outputs: [] },
] as const;

const ERC20_APPROVE_ABI = [
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
] as const;

const ZERO  = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const BO    = CONTRACTS.BorrowerOperations as `0x${string}`;
const COLL  = CONTRACTS.WzkLTC            as `0x${string}`;
const RPC   = "https://liteforge.rpc.caldera.xyz/http";

export type TxStatus = "idle" | "approving" | "pending" | "success" | "error";

export function useTroveActions(address: `0x${string}` | undefined) {
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error,  setError]  = useState("");

  const reset = () => { setStatus("idle"); setTxHash(""); setError(""); };

  const pub = createPublicClient({ transport: http(RPC) });

  async function ensureApproval(amount: bigint) {
    if (!address) return;
    const allowance = await pub.readContract({
      address: COLL, abi: ERC20_APPROVE_ABI,
      functionName: "allowance", args: [address, BO],
    }) as bigint;
    if (allowance < amount) {
      setStatus("approving");
      const hash = await writeContractAsync({
        address: COLL, abi: ERC20_APPROVE_ABI,
        functionName: "approve", args: [BO, maxUint256],
      });
      await pub.waitForTransactionReceipt({ hash });
    }
  }

  async function run(fn: () => Promise<`0x${string}`>) {
    setStatus("pending");
    setError("");
    try {
      const hash = await fn();
      setTxHash(hash);
      await pub.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Transaction failed");
      setStatus("error");
    }
  }

  // ── openTrove ───────────────────────────────────────────────────────────────
  async function openTrove(collStr: string, fnUSDStr: string) {
    reset();
    const collAmt  = parseUnits(collStr,  8); // WzkLTC 8 dec
    const fnUSDAmt = parseUnits(fnUSDStr, 6); // FnUSD 6 dec
    await ensureApproval(collAmt);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "openTrove",
      args: [collAmt, fnUSDAmt, ZERO, ZERO],
    }));
  }

  // ── addColl ─────────────────────────────────────────────────────────────────
  async function addColl(collStr: string) {
    reset();
    const collAmt = parseUnits(collStr, 8);
    await ensureApproval(collAmt);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "addColl",
      args: [collAmt, ZERO, ZERO],
    }));
  }

  // ── withdrawColl ────────────────────────────────────────────────────────────
  async function withdrawColl(collStr: string) {
    reset();
    const collAmt = parseUnits(collStr, 8);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "withdrawColl",
      args: [collAmt, ZERO, ZERO],
    }));
  }

  // ── borrowMore ──────────────────────────────────────────────────────────────
  async function borrowMore(fnUSDStr: string) {
    reset();
    const fnUSDAmt = parseUnits(fnUSDStr, 6);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "withdrawFnUSD",
      args: [fnUSDAmt, ZERO, ZERO],
    }));
  }

  // ── repayFnUSD ──────────────────────────────────────────────────────────────
  async function repayFnUSD(fnUSDStr: string) {
    reset();
    const fnUSDAmt = parseUnits(fnUSDStr, 6);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "repayFnUSD",
      args: [fnUSDAmt, ZERO, ZERO],
    }));
  }

  // ── closeTrove ──────────────────────────────────────────────────────────────
  async function closeTrove() {
    reset();
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "closeTrove",
      args: [],
    }));
  }

  return {
    status, txHash, error, reset,
    openTrove, addColl, withdrawColl, borrowMore, repayFnUSD, closeTrove,
  };
}
