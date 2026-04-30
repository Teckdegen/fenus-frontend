import { ExternalLink } from "lucide-react";
import { Card, PageHeader, Stat } from "@/components/app/Shared";

const pools = [
  { pair: "FnUSD / zkLTC", venue: "LiteSwap", tvl: "$0", apr: "0%", url: "#" },
  { pair: "FnUSD / USDC", venue: "LiteSwap", tvl: "$0", apr: "0%", url: "#" },
];

const Pools = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Liquidity Pools"
        title="Provide liquidity. Earn fees."
        description="Supply FnUSD pairs on LiteVM DEXs to earn trading fees and incentives."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><Stat label="Total LP TVL" value="$0" /></Card>
        <Card><Stat label="24h Volume" value="$0" /></Card>
        <Card><Stat label="Your LP Value" value="$0" /></Card>
      </div>

      <div className="mt-8">
        <p className="mb-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Pools
        </p>
        <Card className="p-0">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:grid">
            <span>Pair</span>
            <span>Venue</span>
            <span>TVL</span>
            <span>APR</span>
            <span />
          </div>
          {pools.map((p) => (
            <div
              key={p.pair}
              className="grid grid-cols-2 items-center gap-4 border-t border-border px-6 py-5 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
            >
              <span className="font-display text-base font-medium">{p.pair}</span>
              <span className="text-sm text-muted-foreground">{p.venue}</span>
              <span className="font-display text-sm">{p.tvl}</span>
              <span className="font-display text-sm">{p.apr}</span>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium transition hover:bg-foreground/5 sm:col-span-1"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Pools;
