import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/lib/contracts";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

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
] as const;

// Read directly from the DIA Chainlink adapter — same source the contract uses.
// This gives us a live price even before fetchPrice() has been called on-chain.
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

// DIA LTC/USD adapter on LitVM LiteForge — 18 decimal price
const DIA_ADAPTER = "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29" as const;

// ─── Format helper ────────────────────────────────────────────────────────────
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

  // WzkLTC balance — 8 decimals
  const { data: wzkLTCBal } = useReadContract({
    address: CONTRACTS.WzkLTC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  // FnUSD balance — 6 decimals
  const { data: fnUSDBal } = useReadContract({
    address: CONTRACTS.FnUSD as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled, refetchInterval: 10_000 },
  });

  // LTC/USD price — read directly from DIA adapter (18 decimals)
  // This works immediately without needing fetchPrice() called first
  const { data: diaData } = useReadContract({
    address: DIA_ADAPTER,
    abi: DIA_ADAPTER_ABI,
    functionName: "latestRoundData",
    query: { enabled: true, refetchInterval: 30_000 },
  });

  // Trove state
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

  // Default pool totals
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

  // ─── Derived values ─────────────────────────────────────────────────────────

  // DIA answer is 18-decimal — parse directly
  const priceNum = diaData ? parseFloat(formatUnits(diaData[1] as bigint, 18)) : 0;

  const collNum  = troveColl ? parseFloat(formatUnits(troveColl, 18)) : 0;
  const debtNum  = troveDebt ? parseFloat(formatUnits(troveDebt, 18)) : 0;
  const hasTrove = troveStatus === 1; // Status.Active = 1

  const collUSD  = priceNum > 0 ? collNum * priceNum : 0;
  const ratio    = debtNum > 0 && collUSD > 0 ? collUSD / debtNum : null;
  const liqPrice = debtNum > 0 && collNum > 0 ? (debtNum * 1.3) / collNum : null;

  return {
    isConnected,
    address,
    priceNum,
    hasTrove,

    // Formatted for display
    wzkLTCBalance:   wzkLTCBal !== undefined ? fmt(wzkLTCBal, 8, 4) : "—",
    fnUSDBalance:    fnUSDBal  !== undefined ? fmt(fnUSDBal,  6, 2) : "—",
    ltcPriceUSD:     priceNum  > 0 ? `$${priceNum.toFixed(4)}` : "—",

    // Trove
    troveColl:       fmt(troveColl,  18, 4),
    troveDebt:       fmt(troveDebt,  18, 2),
    troveCollUSD:    collUSD > 0 ? `$${collUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—",
    troveRatio:      ratio    ? `${(ratio * 100).toFixed(1)}%` : "N/A",
    troveLiqPrice:   liqPrice ? `$${liqPrice.toFixed(4)}` : "N/A",

    // Default pool
    defaultPoolColl: fmt(defaultPoolColl, 18, 4),
    defaultPoolDebt: fmt(defaultPoolDebt, 18, 2),

    // Raw bigints
    raw: { wzkLTCBal, fnUSDBal, troveColl, troveDebt },
  };
}
