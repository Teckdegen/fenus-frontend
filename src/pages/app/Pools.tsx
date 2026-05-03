import { ExternalLink } from "lucide-react";
import { Card, Row, SectionLabel, TokenIcon, TOKEN_IMAGES } from "@/components/app/Shared";

const pools = [
  {
    pair: "FnUSD / aUSDC",
    token0: "FnUSD",
    token1: "aUSDC",
    venue: "Addax",
    tvl: "$0",
    apr: "0.00%",
    url: "https://www.addax.finance/pools/0xa299a878b7b696d966b3b69e7e3ed7bd4a050b26",
    status: "live",
  },
  {
    pair: "FnUSD / wzkLTC",
    token0: "FnUSD",
    token1: "wzkLTC",
    venue: "Addax",
    tvl: "$0",
    apr: "0.00%",
    url: "#",
    status: "coming-soon",
  },
];

const Pools = () => {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Pools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide liquidity on Addax and earn trading fees.
        </p>
      </div>

      <Card className="p-5">
        <Row label="Total LP TVL"  value="$0" />
        <Row label="24h Volume"    value="$0" />
        <Row label="Your LP Value" value="$0" />
      </Card>

      <div>
        <SectionLabel>Available Pools</SectionLabel>
        <Card className="p-2">
          {pools.map((p) => (
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
                      <p className="font-display text-sm tabular-nums">{p.apr} APR</p>
                      <p className="text-[11px] tabular-nums text-muted-foreground">TVL {p.tvl}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                  </>
                )}
              </div>
            </a>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Pools;
