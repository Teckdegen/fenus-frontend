import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, Row, SectionLabel, TokenIcon } from "@/components/app/Shared";

interface PoolData {
  tvlUsd: number;
  volumeUsd: number;
  feesUsd: number;
  swapCount: number;
}

const POOL_ADDRESS = "0xa299a878b7b696d966b3b69e7e3ed7bd4a050b26";
const ADDAX_API = `https://addax.finance/api/pools/${POOL_ADDRESS}`;

const pools = [
  {
    pair: "FnUSD / aUSDC",
    token0: "FnUSD",
    token1: "aUSDC",
    venue: "Addax",
    url: "https://www.addax.finance/pools/0xa299a878b7b696d966b3b69e7e3ed7bd4a050b26",
    status: "live",
    poolAddress: POOL_ADDRESS,
  },
  {
    pair: "FnUSD / wzkLTC",
    token0: "FnUSD",
    token1: "wzkLTC",
    venue: "Addax",
    url: "#",
    status: "coming-soon",
    poolAddress: null,
  },
];

const Pools = () => {
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        console.log("Fetching pool data from:", ADDAX_API);
        const response = await fetch(ADDAX_API);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Pool data received:", data);
        
        if (data.pools && data.pools.length > 0) {
          const pool = data.pools[0];
          const poolInfo = {
            tvlUsd: pool.tvlUsd,
            volumeUsd: pool.volumeUsd,
            feesUsd: pool.feesUsd,
            swapCount: pool.swapCount,
          };
          console.log("Setting pool data:", poolInfo);
          setPoolData(poolInfo);
          setError(null);
        } else {
          setError("No pool data available");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch pool data";
        console.error("Error fetching pool data:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUSD = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const calculateAPR = () => {
    if (!poolData || poolData.tvlUsd === 0) return "0.00%";
    // Annualized APR from 24h fees
    const dailyFees = poolData.feesUsd;
    const yearlyFees = dailyFees * 365;
    const apr = (yearlyFees / poolData.tvlUsd) * 100;
    return `${apr.toFixed(2)}%`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Pools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide liquidity on Addax and earn trading fees.
        </p>
      </div>

      <Card className="p-5">
        {error && (
          <div className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {error}
          </div>
        )}
        <Row 
          label="Total LP TVL" 
          value={loading ? "Loading..." : poolData ? formatUSD(poolData.tvlUsd) : "$0"} 
        />
        <Row 
          label="24h Volume" 
          value={loading ? "Loading..." : poolData ? formatUSD(poolData.volumeUsd) : "$0"} 
        />
        <Row 
          label="24h Fees" 
          value={loading ? "Loading..." : poolData ? formatUSD(poolData.feesUsd) : "$0"} 
        />
      </Card>

      <div>
        <SectionLabel>Available Pools</SectionLabel>
        <Card className="p-2">
          {pools.map((p) => {
            const isLive = p.status === "live";
            const apr = isLive && poolData ? calculateAPR() : "0.00%";
            const tvl = isLive && poolData ? formatUSD(poolData.tvlUsd) : "$0";

            return (
              <a
                key={p.pair}
                href={p.status === "coming-soon" ? undefined : p.url}
                target={p.status === "coming-soon" ? undefined : "_blank"}
                rel={p.status === "coming-soon" ? undefined : "noopener noreferrer"}
                className={`flex items-center justify-between rounded-2xl px-3 py-3.5 transition ${
                  p.status === "coming-soon" 
                    ? "cursor-default opacity-60" 
                    : "hover:bg-foreground/[0.04]"
                }`}
                onClick={(e) => p.status === "coming-soon" && e.preventDefault()}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <TokenIcon symbol={p.token0} className="h-9 w-9 border-2 border-card" />
                    <TokenIcon symbol={p.token1} className="h-9 w-9 border-2 border-card" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-medium">{p.pair}</p>
                      {p.status === "coming-soon" && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.status !== "coming-soon" && (
                    <>
                      <div className="text-right">
                        <p className="font-display text-sm tabular-nums">
                          {loading ? "..." : apr} APR
                        </p>
                        <p className="text-[11px] tabular-nums text-muted-foreground">
                          TVL {loading ? "..." : tvl}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </Card>
      </div>
    </div>
  );
};

export default Pools;
