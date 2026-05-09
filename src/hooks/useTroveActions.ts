// useTroveActions — all on-chain Trove operations wired to BorrowerOperations.
// Gas limits are set explicitly to avoid estimation failures when the contract
// calls fetchPrice() (a state-changing oracle function) during gas estimation.

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { parseUnits, maxUint256, createPublicClient, http } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const BO_ABI = [
  {
    name: "openTrove",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collAmount", type: "uint256" },
      { name: "fnUSDAmount6", type: "uint256" },
      { name: "upperHint", type: "address" },
      { name: "lowerHint", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "addColl",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collAmount", type: "uint256" },
      { name: "upperHint", type: "address" },
      { name: "lowerHint", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "withdrawColl",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collAmount", type: "uint256" },
      { name: "upperHint", type: "address" },
      { name: "lowerHint", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "withdrawFnUSD",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fnUSDAmount6", type: "uint256" },
      { name: "upperHint", type: "address" },
      { name: "lowerHint", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "repayFnUSD",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fnUSDAmount6", type: "uint256" },
      { name: "upperHint", type: "address" },
      { name: "lowerHint", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "closeTrove",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

const TM_ABI = [
  {
    name: "getTroveDebt",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const ERC20_APPROVE_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const BO = CONTRACTS.BorrowerOperations as `0x${string}`;
const COLL = CONTRACTS.WzkLTC as `0x${string}`;
const TM = CONTRACTS.TroveManager as `0x${string}`;
const RPC = "https://liteforge.rpc.caldera.xyz/http";
const CHAIN_ID = CONTRACTS.chainId;

// FnUSD external is 6 decimals; protocol debt accounting is 18.
const FNUSD_SCALE = 1_000_000_000_000n; // 1e12

// MASSIVE gas limits to handle SortedTroves complexity with many active troves
// Each operation gets 3M+ gas with retry logic up to 5M gas maximum
const GAS = {
  openTrove: BigInt(30_000_000), // 30M base, up to 50M with retry
  addColl: BigInt(25_000_000), // 25M base, up to 40M with retry
  withdrawColl: BigInt(25_000_000), // 25M base, up to 40M with retry
  borrowMore: BigInt(25_000_000), // 25M base, up to 40M with retry
  repayFnUSD: BigInt(20_000_000), // 20M base, up to 35M with retry
  closeTrove: BigInt(20_000_000), // 20M base, up to 35M with retry
  approve: BigInt(2_000_000), // 2M for approvals
};

export type TxStatus = "idle" | "approving" | "pending" | "success" | "error";

export interface TxResult {
  type: string;
  amount?: string;
  amount2?: string;
  txHash: string;
  reverted?: boolean;
  revertReason?: string;
}

export function useTroveActions(address: `0x${string}` | undefined) {
  const { writeContractAsync } = useWriteContract();
  const write = (request: any) => writeContractAsync(request);
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  const reset = () => {
    setStatus("idle");
    setTxHash("");
    setError("");
    setTxResult(null);
  };

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
    const allowance = (await pub.readContract({
      address: COLL,
      abi: ERC20_APPROVE_ABI,
      functionName: "allowance",
      args: [address, BO],
    })) as bigint;
    if (allowance < amount) {
      setStatus("approving");

      // Retry approval with increasing gas limits
      const gasLimits = [GAS.approve, BigInt(3_000_000), BigInt(5_000_000)];

      for (let i = 0; i < gasLimits.length; i++) {
        try {
          const fees = await feeOverrides();
          const hash = await write({
            chainId: CHAIN_ID,
            address: COLL,
            abi: ERC20_APPROVE_ABI,
            functionName: "approve",
            args: [BO, maxUint256],
            gas: gasLimits[i],
            ...fees,
          });
          const receipt = await pub.waitForTransactionReceipt({ hash });
          if (receipt.status === "reverted") {
            throw new Error("Approval transaction reverted. Please try again.");
          }
          return; // Success
        } catch (e: any) {
          const isOutOfGas =
            e?.message?.includes("out of gas") ||
            e?.message?.includes("gas required exceeds allowance") ||
            e?.shortMessage?.includes("out of gas") ||
            e?.message?.includes("execution reverted");

          if (i === gasLimits.length - 1 || !isOutOfGas) {
            throw e;
          }
          // Continue to next gas limit
        }
      }
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
      const receipt = await pub.waitForTransactionReceipt({ hash });

      // Check if the transaction actually succeeded on-chain
      if (receipt.status === "reverted") {
        // Show reverted state in the modal with the tx hash so user can inspect
        setTxResult({
          type,
          amount,
          amount2,
          txHash: hash,
          reverted: true,
          revertReason:
            "The transaction was submitted but reverted on-chain. The price oracle may be temporarily unavailable. Please wait a few minutes and try again.",
        });
        setStatus("error");
        return;
      }

      setTxResult({ type, amount, amount2, txHash: hash });
      setStatus("success");
    } catch (e: any) {
      const msg =
        e?.shortMessage || e?.details || e?.message || "Transaction failed";
      setError(msg);
      setStatus("error");
    }
  }

  // wzkLTC (WzkLTC token) is 8 decimals — all collateral amounts use parseUnits(str, 8)
  // FnUSD external surface is 6 decimals — all debt amounts use parseUnits(str, 6)

  async function openTrove(collStr: string, fnUSDStr: string) {
    reset();
    // Strip commas from formatted numbers before parsing
    const collClean = collStr.replace(/,/g, "");
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const collAmt = parseUnits(collClean, 8);
    const fnUSDAmt = parseUnits(fnUSDClean, 6);
    await ensureApproval(collAmt);

    // Aggressive retry with massive gas limits
    const gasLimits = [GAS.openTrove, BigInt(40_000_000), BigInt(50_000_000)];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(
          async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "openTrove",
              args: [collAmt, fnUSDAmt, ZERO, ZERO],
              gas: gasLimits[i],
              ...fees,
            });
          },
          "Open Trove",
          `${fnUSDClean} FnUSD`,
          `${collClean} wzkLTC`,
        );
        return; // Success, exit retry loop
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        // If it's the last attempt or not a gas issue, throw the error
        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        // Otherwise, continue to next gas limit
        reset(); // Reset status for retry
      }
    }
  }

  async function addColl(collStr: string) {
    reset();
    const collClean = collStr.replace(/,/g, "");
    const collAmt = parseUnits(collClean, 8);
    await ensureApproval(collAmt);

    // Aggressive retry with massive gas limits
    const gasLimits = [GAS.addColl, BigInt(35_000_000), BigInt(40_000_000)];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(
          async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "addColl",
              args: [collAmt, ZERO, ZERO],
              gas: gasLimits[i],
              ...fees,
            });
          },
          "Add Collateral",
          `${collClean} wzkLTC`,
        );
        return;
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        reset();
      }
    }
  }

  async function withdrawColl(collStr: string) {
    reset();
    const collClean = collStr.replace(/,/g, "");
    const collAmt = parseUnits(collClean, 8);

    // Aggressive retry with massive gas limits
    const gasLimits = [
      GAS.withdrawColl,
      BigInt(35_000_000),
      BigInt(40_000_000),
    ];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(
          async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "withdrawColl",
              args: [collAmt, ZERO, ZERO],
              gas: gasLimits[i],
              ...fees,
            });
          },
          "Remove Collateral",
          `${collClean} wzkLTC`,
        );
        return;
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        reset();
      }
    }
  }

  async function borrowMore(fnUSDStr: string) {
    reset();
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const fnUSDAmt = parseUnits(fnUSDClean, 6);

    // Aggressive retry with massive gas limits
    const gasLimits = [GAS.borrowMore, BigInt(35_000_000), BigInt(40_000_000)];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(
          async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "withdrawFnUSD",
              args: [fnUSDAmt, ZERO, ZERO],
              gas: gasLimits[i],
              ...fees,
            });
          },
          "Borrow FnUSD",
          `${fnUSDClean} FnUSD`,
        );
        return;
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        reset();
      }
    }
  }

  async function repayFnUSD(fnUSDStr: string) {
    reset();
    const fnUSDClean = fnUSDStr.replace(/,/g, "");
    const fnUSDAmt = parseUnits(fnUSDClean, 6);

    // If user is repaying (at least) the entire current debt, closing is the correct op.
    // It avoids dust/rounding issues and matches user intent: "repay all" => close.
    const debt18 = address
      ? await pub.readContract({
          address: TM,
          abi: TM_ABI,
          functionName: "getTroveDebt",
          args: [address],
        })
      : 0n;
    const repay6Needed = (debt18 + FNUSD_SCALE - 1n) / FNUSD_SCALE; // round up
    const shouldClose = debt18 > 0n && fnUSDAmt >= repay6Needed;

    if (shouldClose) {
      // Use closeTrove with massive retry logic
      const gasLimits = [
        GAS.closeTrove,
        BigInt(30_000_000),
        BigInt(35_000_000),
      ];

      for (let i = 0; i < gasLimits.length; i++) {
        try {
          await run(async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "closeTrove",
              args: [],
              gas: gasLimits[i],
              ...fees,
            });
          }, "Close Trove");
          return;
        } catch (e: any) {
          const isOutOfGas =
            e?.message?.includes("out of gas") ||
            e?.message?.includes("gas required exceeds allowance") ||
            e?.shortMessage?.includes("out of gas") ||
            e?.message?.includes("execution reverted");

          if (i === gasLimits.length - 1 || !isOutOfGas) {
            throw e;
          }
          reset();
        }
      }
      return;
    }

    // Regular repay with massive retry logic
    const gasLimits = [GAS.repayFnUSD, BigInt(30_000_000), BigInt(35_000_000)];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(
          async () => {
            const fees = await feeOverrides();
            return write({
              chainId: CHAIN_ID,
              address: BO,
              abi: BO_ABI,
              functionName: "repayFnUSD",
              args: [fnUSDAmt, ZERO, ZERO],
              gas: gasLimits[i],
              ...fees,
            });
          },
          "Repay Debt",
          `${fnUSDClean} FnUSD`,
        );
        return;
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        reset();
      }
    }
  }

  async function closeTrove() {
    reset();

    // Aggressive retry with massive gas limits
    const gasLimits = [GAS.closeTrove, BigInt(30_000_000), BigInt(35_000_000)];

    for (let i = 0; i < gasLimits.length; i++) {
      try {
        await run(async () => {
          const fees = await feeOverrides();
          return write({
            chainId: CHAIN_ID,
            address: BO,
            abi: BO_ABI,
            functionName: "closeTrove",
            args: [],
            gas: gasLimits[i],
            ...fees,
          });
        }, "Close Trove");
        return;
      } catch (e: any) {
        const isOutOfGas =
          e?.message?.includes("out of gas") ||
          e?.message?.includes("gas required exceeds allowance") ||
          e?.shortMessage?.includes("out of gas") ||
          e?.message?.includes("execution reverted");

        if (i === gasLimits.length - 1 || !isOutOfGas) {
          throw e;
        }
        reset();
      }
    }
  }

  return {
    status,
    txHash,
    error,
    txResult,
    reset,
    openTrove,
    addColl,
    withdrawColl,
    borrowMore,
    repayFnUSD,
    closeTrove,
  };
}
