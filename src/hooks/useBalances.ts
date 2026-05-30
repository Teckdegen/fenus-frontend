import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import { CONTRACTS } from "@/lib/contracts";
import { DIA_ADAPTER } from "@/lib/oracles";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

const TROVE_MANAGER_ABI = [
  { name: "getTroveStatus", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint8" }] },
  { name: "getTroveColl", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "getTroveDebt", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "getEntireDebtAndColl", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "debt", type: "uint256" }, { name: "coll", type: "uint256" }] },
] as const;

const DIA_ADAPTER_ABI = [
  { name: "latestRoundData", type: "function", stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId",         type: "uint80"  },
      { name: "answer",          type: "int256"  },
      { name: "startedAt",       type: "uint256" },
      { name: "updatedAt",       type: "uint256" },
      { name: "answeredInRound", type: "uint80"  },
    ] },
] as const;

const DEFAULT_POOL_ABI = [
  { name: "getCollateral", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getDebt", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

const SORTED_TROVES_ABI = [
  { name: "contains", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "bool" }] },
] as const;

// ─── Format helpers ───────────────────────────────────────────────────────────

// Compact number: 1,234 -> "1.23K", 1,234,567 -> "1.23M"
// Only compact numbers >= 10,000 to avoid showing "1.00K" for small balances like 1 wzkLTC
function compact(n: number, dp = 2): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(dp)}M`;
  if (n >= 10_000)    return `${(n / 1_000).toFixed(dp)}K`;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dp });
}

// Format a bigint token amount with compact notation
function fmtCompact(val: bigint | undefined, decimals: number): string {
  if (val === undefined || val === null) return "0.00";
  const n = parseFloat(formatUnits(val, decimals));
  // If it's a tiny non-zero, allow more precision so it doesn't render as 0.
  const dp = n > 0 && n < 0.01 ? Math.min(decimals, 8) : 2;
  return compact(n, dp);
}

// Format a bigint token amount with full precision (for inputs/rows)
function fmt(val: bigint | undefined, decimals: number, dp = 4): string {
  if (val === undefined || val === null) return "0.00";
  const n = parseFloat(formatUnits(val, decimals));
  const maxDp = n > 0 && n < 0.01 ? Math.min(decimals, 8) : dp;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxDp });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBalances() {
  const { address, isConnected } = useAccount();
  const enabled = isConnected && !!address;

  // CoinGecko fallback price when DIA oracle is stale
  const [cgPrice, setCgPrice] = useState<number>(0);
  useEffect(() => {
    const fetchCgPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd"
        );
        const data = await res.json();
        if (data?.litecoin?.usd) setCgPrice(data.litecoin.usd);
      } catch {
        // silently fail
      }
    };
    fetchCgPrice();
    const id = setInterval(fetchCgPrice, 60_000);
    return () => clearInterval(id);
  }, []);

  const { data: wzkLTCBal } = useReadContract({
    address: CONTRACTS.WzkLTC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const { data: fnUSDBal } = useReadContract({
    address: CONTRACTS.FnUSD as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const { data: diaData } = useReadContract({
    address: DIA_ADAPTER,
    abi: DIA_ADAPTER_ABI,
    functionName: "latestRoundData",
    query: { enabled: true, refetchInterval: 30_000 },
  });

  const { data: troveStatus } = useReadContract({
    address: CONTRACTS.TroveManager as `0x${string}`,
    abi: TROVE_MANAGER_ABI,
    functionName: "getTroveStatus",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const { data: inSortedTroves } = useReadContract({
    address: CONTRACTS.SortedTroves as `0x${string}`,
    abi: SORTED_TROVES_ABI,
    functionName: "contains",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const { data: troveColl } = useReadContract({
    address: CONTRACTS.TroveManager as `0x${string}`,
    abi: TROVE_MANAGER_ABI,
    functionName: "getTroveColl",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const { data: troveDebt } = useReadContract({
    address: CONTRACTS.TroveManager as `0x${string}`,
    abi: TROVE_MANAGER_ABI,
    functionName: "getTroveDebt",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  const hasTroveActive = enabled && troveStatus === 1;

  const { data: entireDebtAndColl } = useReadContract({
    address: CONTRACTS.TroveManager as `0x${string}`,
    abi: TROVE_MANAGER_ABI,
    functionName: "getEntireDebtAndColl",
    args: [address!],
    query: { enabled: hasTroveActive, refetchInterval: 10_000 },
  });

  const { data: defaultPoolColl } = useReadContract({
    address: CONTRACTS.DefaultPool as `0x${string}`,
    abi: DEFAULT_POOL_ABI,
    functionName: "getCollateral",
    query: { enabled: true, refetchInterval: 15_000 },
  });

  const { data: defaultPoolDebt } = useReadContract({
    address: CONTRACTS.DefaultPool as `0x${string}`,
    abi: DEFAULT_POOL_ABI,
    functionName: "getDebt",
    query: { enabled: true, refetchInterval: 15_000 },
  });

  // ─── Derived ──────────────────────────────────────────────────────────────
  const diaPrice = diaData ? parseFloat(formatUnits(diaData[1] as bigint, 18)) : 0;
  // Check if DIA oracle is stale — updatedAt more than 1 hour ago
  const diaUpdatedAt = diaData ? Number(diaData[3]) : 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const diaIsDown = diaData !== undefined && (
    diaPrice === 0 ||
    (diaUpdatedAt > 0 && nowSec - diaUpdatedAt > 3600)
  );
  // Use DIA on-chain price first, fall back to CoinGecko if oracle is stale
  const priceNum = diaPrice > 0 ? diaPrice : cgPrice;
  const collNum  = troveColl ? parseFloat(formatUnits(troveColl, 18)) : 0;
  
  // Use ENTIRE debt (recorded + pending redistribution) for accurate display
  const entireDebt = entireDebtAndColl?.[0];
  const debtNum  = entireDebt ? parseFloat(formatUnits(entireDebt, 18)) : 
                   troveDebt ? parseFloat(formatUnits(troveDebt, 18)) : 0;
  
  const hasTrove = troveStatus === 1;
  const sortedListChecked =
    enabled && inSortedTroves !== undefined && troveStatus !== undefined;
  // Still listed after liquidation/close bug — openTrove will revert with AlreadyExists()
  const isZombieInSortedList =
    sortedListChecked && inSortedTroves === true && troveStatus !== 1;
  const entireColl = entireDebtAndColl?.[1];

  const collUSD  = priceNum > 0 ? collNum * priceNum : 0;
  const ratio    = debtNum > 0 && collUSD > 0 ? collUSD / debtNum : null;
  const liqPrice = debtNum > 0 && collNum > 0 ? (debtNum * 1.3) / collNum : null;

  return {
    isConnected,
    address,
    priceNum,
    diaIsDown,
    hasTrove,
    inSortedTroves: inSortedTroves === true,
    isZombieInSortedList,
    sortedListChecked,

    // Compact display (K/M) for balance strips
    wzkLTCBalance:   fmtCompact(wzkLTCBal, 8),
    fnUSDBalance:    fmtCompact(fnUSDBal,  6),
    // Price — no $ prefix here, callers add it if needed
    ltcPriceUSD:     priceNum > 0 ? priceNum.toFixed(2) : "0.00",

    // Full precision for inputs and rows
    wzkLTCBalanceFull: fmt(wzkLTCBal, 8, 4),
    fnUSDBalanceFull:  fmt(fnUSDBal,  6, 2),

    // Trove
    troveColl:       fmt(troveColl, 18, 4),
    // Collateral returned on close (recorded + pending redistribution)
    troveCollClose:  fmt(entireColl ?? troveColl, 18, 4),
    troveDebt:       fmt(troveDebt, 18, 2),
    troveCollUSD:    collUSD > 0 ? `$${compact(collUSD)}` : "$0.00",
    troveRatio:      ratio    ? `${(ratio * 100).toFixed(1)}%` : "N/A",
    troveLiqPrice:   liqPrice ? `$${liqPrice.toFixed(4)}` : "N/A",

    // Default pool
    defaultPoolColl: fmt(defaultPoolColl, 18, 4),
    defaultPoolDebt: fmt(defaultPoolDebt, 18, 2),

    // Raw bigints for contract calls
    raw: { wzkLTCBal, fnUSDBal, troveColl, troveDebt },
  };
}
