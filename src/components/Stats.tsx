import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import MuxVideo from "./MuxVideo";
import { CONTRACTS } from "@/lib/contracts";

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const FNUSD_ABI = [
  { name: "totalSupply",   type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

const ACTIVE_POOL_ABI = [
  { name: "getCollateral", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
] as const;

const DIA_ABI = [
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

const DIA_ADAPTER = "0x45dDa5d881BD2C917976CCfde74fFd6f6412da29" as const;

// ─── Compact number formatter ─────────────────────────────────────────────────
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// ─── Component ────────────────────────────────────────────────────────────────
const Stats = () => {
  // FnUSD total supply (6 decimals) — this IS FnUSD minted
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.FnUSD as `0x${string}`,
    abi: FNUSD_ABI,
    functionName: "totalSupply",
    query: { refetchInterval: 30_000 },
  });

  // ActivePool collateral (18-dec internal WzkLTC) — used for TVL
  const { data: poolColl } = useReadContract({
    address: CONTRACTS.ActivePool as `0x${string}`,
    abi: ACTIVE_POOL_ABI,
    functionName: "getCollateral",
    query: { refetchInterval: 30_000 },
  });

  // LTC/USD price from DIA
  const { data: diaData } = useReadContract({
    address: DIA_ADAPTER,
    abi: DIA_ABI,
    functionName: "latestRoundData",
    query: { refetchInterval: 30_000 },
  });

  // ── Derived ──────────────────────────────────────────────────────────────
  const priceUSD   = diaData ? parseFloat(formatUnits(diaData[1] as bigint, 18)) : 0;
  const collNum    = poolColl ? parseFloat(formatUnits(poolColl, 18)) : 0;
  const tvlUSD     = priceUSD > 0 ? collNum * priceUSD : 0;
  const fnUSDMinted = totalSupply ? parseFloat(formatUnits(totalSupply, 6)) : 0;

  // FnUSD holders — approximated from supply (non-zero balances can't be
  // counted on-chain without an indexer; show supply as the primary metric)
  // We show "FnUSD Supply" instead of holders since supply is accurate on-chain
  const stats = [
    {
      label: "TVL",
      value: tvlUSD > 0 ? `$${compact(tvlUSD)}` : "$0",
    },
    {
      label: "FnUSD Minted",
      value: fnUSDMinted > 0 ? compact(fnUSDMinted) : "0",
    },
    {
      label: "LTC Price",
      value: priceUSD > 0 ? `$${priceUSD.toFixed(2)}` : "$0",
    },
  ];

  return (
    <section id="stats" className="relative isolate overflow-hidden py-32 sm:py-40">
      <MuxVideo
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/50" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 sm:grid-cols-3 sm:gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
