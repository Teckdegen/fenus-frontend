import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import MuxVideo from "./MuxVideo";
import { CONTRACTS } from "@/lib/contracts";
import { DIA_ADAPTER } from "@/lib/oracles";

// ─── ABIs ─────────────────────────────────────────────────────────────────────
const FNUSD_ABI = [
  { name: "totalSupply", type: "function", stateMutability: "view",
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

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function countDurationFor(target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  const digits = Math.floor(Math.log10(Math.max(target, 1))) + 1;
  return Math.min(4_500, Math.max(1_800, 1_250 + digits * 400));
}

// Count-up hook: animates from the current display value to `target` over `duration` ms (ease-out).
function useCountUp(target: number, duration = 4000) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!target || target <= 0) {
      setValue(0);
      return;
    }
    fromRef.current = value;
    startRef.current = null;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Stats = () => {
  // FnUSD total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.FnUSD as `0x${string}`,
    abi: FNUSD_ABI,
    functionName: "totalSupply",
    query: { refetchInterval: 30_000 },
  });

  // ActivePool collateral for TVL
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
  const priceUSD    = diaData ? parseFloat(formatUnits(diaData[1] as bigint, 18)) : 0;
  const collNum     = poolColl ? parseFloat(formatUnits(poolColl, 18)) : 0;
  const tvlUSD      = priceUSD > 0 ? collNum * priceUSD : 0;
  const fnUSDMinted = totalSupply ? parseFloat(formatUnits(totalSupply, 6)) : 0;

  const animatedTvl    = useCountUp(tvlUSD, countDurationFor(tvlUSD));
  const animatedMinted = useCountUp(fnUSDMinted, countDurationFor(fnUSDMinted));

  const stats = [
    {
      label: "TVL",
      value: tvlUSD > 0 ? `$${compact(animatedTvl)}` : "$0",
    },
    {
      label: "FnUSD Minted",
      value: fnUSDMinted > 0 ? compact(animatedMinted) : "0",
    },
  ];

  return (
    <section id="stats" className="relative isolate overflow-hidden py-32 sm:py-40">
      <MuxVideo
        src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/50" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 sm:grid-cols-2 sm:gap-8 max-w-2xl">
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
