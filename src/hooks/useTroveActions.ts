// useTroveActions — all on-chain Trove operations wired to BorrowerOperations.
// Gas limits are set explicitly to avoid estimation failures when the contract
// calls fetchPrice() (a state-changing oracle function) during gas estimation.

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

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const BO   = CONTRACTS.BorrowerOperations as `0x${string}`;
const COLL = CONTRACTS.WzkLTC            as `0x${string}`;
const RPC  = "https://liteforge.rpc.caldera.xyz/http";

// Explicit gas limits — prevents the "tx fee exceeds cap" error that occurs
// when the oracle's fetchPrice() (state-changing) is called during estimation.
const GAS = {
  openTrove:    BigInt(800_000),
  addColl:      BigInt(400_000),
  withdrawColl: BigInt(400_000),
  borrowMore:   BigInt(400_000),
  repayFnUSD:   BigInt(300_000),
  closeTrove:   BigInt(500_000),
  approve:      BigInt(100_000),
};

export type TxStatus = "idle" | "approving" | "pending" | "success" | "error";

export interface TxResult {
  type: string;
  amount?: string;
  amount2?: string;
  txHash: string;
}

export function useTroveActions(address: `0x${string}` | undefined) {
  const { writeContractAsync } = useWriteContract();
  const [status,   setStatus]   = useState<TxStatus>("idle");
  const [txHash,   setTxHash]   = useState("");
  const [error,    setError]    = useState("");
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  const reset = () => { setStatus("idle"); setTxHash(""); setError(""); setTxResult(null); };

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
        functionName: "approve",
        args: [BO, maxUint256],
        gas: GAS.approve,
      });
      await pub.waitForTransactionReceipt({ hash });
    }
  }

  async function run(fn: () => Promise<`0x${string}`>, type: string, amount?: string, amount2?: string) {
    setStatus("pending");
    setError("");
    try {
      const hash = await fn();
      setTxHash(hash);
      await pub.waitForTransactionReceipt({ hash });
      setTxResult({ type, amount, amount2, txHash: hash });
      setStatus("success");
    } catch (e: any) {
      const msg = e?.shortMessage || e?.details || e?.message || "Transaction failed";
      setError(msg);
      setStatus("error");
    }
  }

  // WzkLTC is 8 decimals — all collateral amounts use parseUnits(str, 8)
  // FnUSD external surface is 6 decimals — all debt amounts use parseUnits(str, 6)

  async function openTrove(collStr: string, fnUSDStr: string) {
    reset();
    const collAmt  = parseUnits(collStr,  8);
    const fnUSDAmt = parseUnits(fnUSDStr, 6);
    await ensureApproval(collAmt);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "openTrove",
      args: [collAmt, fnUSDAmt, ZERO, ZERO],
      gas: GAS.openTrove,
    }), "Open Trove", `${fnUSDStr} FnUSD`, `${collStr} WzkLTC`);
  }

  async function addColl(collStr: string) {
    reset();
    const collAmt = parseUnits(collStr, 8);
    await ensureApproval(collAmt);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "addColl",
      args: [collAmt, ZERO, ZERO],
      gas: GAS.addColl,
    }), "Add Collateral", `${collStr} WzkLTC`);
  }

  async function withdrawColl(collStr: string) {
    reset();
    const collAmt = parseUnits(collStr, 8);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "withdrawColl",
      args: [collAmt, ZERO, ZERO],
      gas: GAS.withdrawColl,
    }), "Remove Collateral", `${collStr} WzkLTC`);
  }

  async function borrowMore(fnUSDStr: string) {
    reset();
    const fnUSDAmt = parseUnits(fnUSDStr, 6);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "withdrawFnUSD",
      args: [fnUSDAmt, ZERO, ZERO],
      gas: GAS.borrowMore,
    }), "Borrow FnUSD", `${fnUSDStr} FnUSD`);
  }

  async function repayFnUSD(fnUSDStr: string) {
    reset();
    const fnUSDAmt = parseUnits(fnUSDStr, 6);
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "repayFnUSD",
      args: [fnUSDAmt, ZERO, ZERO],
      gas: GAS.repayFnUSD,
    }), "Repay Debt", `${fnUSDStr} FnUSD`);
  }

  async function closeTrove() {
    reset();
    await run(() => writeContractAsync({
      address: BO, abi: BO_ABI, functionName: "closeTrove",
      args: [],
      gas: GAS.closeTrove,
    }), "Close Trove");
  }

  return {
    status, txHash, error, txResult, reset,
    openTrove, addColl, withdrawColl, borrowMore, repayFnUSD, closeTrove,
  };
}
