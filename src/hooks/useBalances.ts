import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const ERC20_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "decimals", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }] },
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
  { name: "getCurrentICR", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "price", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;

const PRICE_FEED_ABI = [
  { name: "getLastGoodPrice", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

const DEFAULT_POOL_ABI = [
  { name: "getCollateral", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getDebt", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(val: bigint | undefined, decimals: number, dp = 4): string {
  if (val === undefined || val === null) return "0.00";
  return parseFloat(formatUnits(val, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: dp,
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBalances() {
  const { address, isConnected } = useAccount();

  const enabled = isConnected && !!address;

  // WzkLTC balance (8 decimals)
  const { data: wzkLTCBal } = useReadContract({
    address: CONTRACTS.WzkLTC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  // FnUSD balance (6 decimals)
  const { data: fnUSDBal } = useReadContract({
    address: CONTRACTS.FnUSD as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  // LTC/USD price (18 decimals)
  const { data: ltcPrice } = useReadContract({
    address: CONTRACTS.PriceFeed as `0x${string}`,
    abi: PRICE_FEED_ABI,
    functionName: "getLastGoodPrice",
    query: { enabled: true, refetchInterval: 30_000 },
  });

  // Trove data
  const { data: troveStatus } = useReadContract({
    address: CONTRACTS.TroveManager as `0x${string}`,
    abi: TROVE_MANAGER_ABI,
    functionName: "getTroveStatus",
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

  // Default pool
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

  // Derived values
  const priceNum   = ltcPrice ? parseFloat(formatUnits(ltcPrice, 18)) : 0;
  const collNum    = troveColl ? parseFloat(formatUnits(troveColl, 18)) : 0;
  const debtNum    = troveDebt ? parseFloat(formatUnits(troveDebt, 18)) : 0;
  const hasTrove   = troveStatus === 1; // Status.Active = 1

  const collUSD    = priceNum > 0 ? collNum * priceNum : 0;
  const ratio      = debtNum > 0 && collUSD > 0 ? collUSD / debtNum : null;
  const liqPrice   = debtNum > 0 && collNum > 0 ? (debtNum * 1.3) / collNum : null;

  return {
    // Raw
    isConnected,
    address,
    priceNum,
    hasTrove,

    // Formatted strings for display
    wzkLTCBalance: wzkLTCBal !== undefined ? fmt(wzkLTCBal, 8, 4) : "—",
    fnUSDBalance:  fnUSDBal  !== undefined ? fmt(fnUSDBal,  6, 2) : "—",
    ltcPriceUSD:   priceNum > 0 ? `$${priceNum.toFixed(4)}` : "—",

    // Trove
    troveColl:     fmt(troveColl, 18, 4),
    troveDebt:     fmt(troveDebt, 18, 2),
    troveCollUSD:  collUSD > 0 ? `$${collUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
    troveRatio:    ratio ? `${(ratio * 100).toFixed(1)}%` : "N/A",
    troveLiqPrice: liqPrice ? `$${liqPrice.toFixed(4)}` : "N/A",

    // Default pool
    defaultPoolColl: fmt(defaultPoolColl, 18, 4),
    defaultPoolDebt: fmt(defaultPoolDebt, 18, 2),

    // Raw bigints for calculations
    raw: { wzkLTCBal, fnUSDBal, ltcPrice, troveColl, troveDebt },
  };
}
