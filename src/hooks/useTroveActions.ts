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
const CHAIN_ID = CONTRACTS.chainId;

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

  /**
   * EIP-1559: maxFeePerGas must be >= baseFee + maxPriorityFeePerGas for the block that mines the tx.
   * LiteForge RPC often returns estimateFeesPerGas() with maxFeePerGas stuck (~10M wei) while baseFee
   * drifts upward — wallets then reject ("max fee less than base fee"). Derive a floor from the
   * pending/latest block header instead of trusting estimate maxFee alone.
   */
  async function feeOverrides(): Promise<
    | { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }
    | { gasPrice: bigint }
  > {
    let base = 0n;
    try {
      const pending = await pub.getBlock({ blockTag: "pending" });
      base = pending.baseFeePerGas ?? 0n;
    } catch {
      /* pending unsupported */
    }
    if (base === 0n) {
      const latest = await pub.getBlock({ blockTag: "latest" });
      base = latest.baseFeePerGas ?? 0n;
    }

    if (base === 0n) {
      const gp = await pub.getGasPrice();
      return { gasPrice: (gp * 13n) / 10n };
    }

    let maxPriorityFeePerGas = base / 4n + 1_000_000n;
    try {
      const est = await pub.estimateFeesPerGas();
      if (est.maxPriorityFeePerGas != null) {
        const bumped = (est.maxPriorityFeePerGas * 13n) / 10n;
        if (bumped > maxPriorityFeePerGas) maxPriorityFeePerGas = bumped;
      }
    } catch {
      /* ignore */
    }

    // Floor maxFee well above current base so small base-fee jumps can't revert the tx.
    const maxFeePerGas = base * 3n + maxPriorityFeePerGas;

    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  async function ensureApproval(amount: bigint) {
    if (!address) return;
    const allowance = await pub.readContract({
      address: COLL, abi: ERC20_APPROVE_ABI,
      functionName: "allowance", args: [address, BO],
    }) as bigint;
    if (allowance < amount) {
      setStatus("approving");
      const fees = await feeOverrides();
      const hash = await writeContractAsync({
        chainId: CHAIN_ID,
        address: COLL, abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [BO, maxUint256],
        gas: GAS.approve,
        ...fees,
      });
      await pub.waitForTransactionReceipt({ hash });
    }
  }

  async function run(
    fn: () => Promise<`0x${string}`>,
    type: string,
    amount?: string,
    amount2?: string,
  ) {
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
    // Strip commas from formatted numbers before parsing
    const collClean  = collStr.replace(/,/g, "");
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const collAmt  = parseUnits(collClean,  8);
    const fnUSDAmt = parseUnits(fnUSDClean, 6);
    await ensureApproval(collAmt);
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "openTrove",
        args: [collAmt, fnUSDAmt, ZERO, ZERO],
        gas: GAS.openTrove,
        ...fees,
      });
    }, "Open Trove", `${fnUSDClean} FnUSD`, `${collClean} WzkLTC`);
  }

  async function addColl(collStr: string) {
    reset();
    const collClean = collStr.replace(/,/g, "");
    const collAmt = parseUnits(collClean, 8);
    await ensureApproval(collAmt);
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "addColl",
        args: [collAmt, ZERO, ZERO],
        gas: GAS.addColl,
        ...fees,
      });
    }, "Add Collateral", `${collClean} WzkLTC`);
  }

  async function withdrawColl(collStr: string) {
    reset();
    const collClean = collStr.replace(/,/g, "");
    const collAmt = parseUnits(collClean, 8);
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "withdrawColl",
        args: [collAmt, ZERO, ZERO],
        gas: GAS.withdrawColl,
        ...fees,
      });
    }, "Remove Collateral", `${collClean} WzkLTC`);
  }

  async function borrowMore(fnUSDStr: string) {
    reset();
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const fnUSDAmt = parseUnits(fnUSDClean, 6);
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "withdrawFnUSD",
        args: [fnUSDAmt, ZERO, ZERO],
        gas: GAS.borrowMore,
        ...fees,
      });
    }, "Borrow FnUSD", `${fnUSDClean} FnUSD`);
  }

  async function repayFnUSD(fnUSDStr: string) {
    reset();
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const fnUSDAmt = parseUnits(fnUSDClean, 6);
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "repayFnUSD",
        args: [fnUSDAmt, ZERO, ZERO],
        gas: GAS.repayFnUSD,
        ...fees,
      });
    }, "Repay Debt", `${fnUSDClean} FnUSD`);
  }

  async function closeTrove() {
    reset();
    await run(async () => {
      const fees = await feeOverrides();
      return writeContractAsync({
        chainId: CHAIN_ID,
        address: BO, abi: BO_ABI, functionName: "closeTrove",
        args: [],
        gas: GAS.closeTrove,
        ...fees,
      });
    }, "Close Trove");
  }

  return {
    status, txHash, error, txResult, reset,
    openTrove, addColl, withdrawColl, borrowMore, repayFnUSD, closeTrove,
  };
}
