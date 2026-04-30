import { Card, PageHeader, SectionLabel, Stat } from "@/components/app/Shared";

const pools = [
  { pair: "FnUSD / zkLTC", venue: "LiteSwap", tvl: "$0", apr: "0.00%", url: "#" },
  { pair: "FnUSD / USDC", venue: "LiteSwap", tvl: "$0", apr: "0.00%", url: "#" },
];

const Pools = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Liquidity Pools"
        title="Provide liquidity. Earn fees."
        description="Supply FnUSD pairs on LiteVM DEXs to earn trading fees and incentives."
      />

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6"><Stat label="Total LP TVL" value="$0" /></Card>
        <Card className="p-6"><Stat label="24h Volume" value="$0" /></Card>
        <Card className="p-6"><Stat label="Your LP Value" value="$0" /></Card>
      </div>

      <SectionLabel>Pools</SectionLabel>
      <Card>
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-4 px-6 py-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:grid">
          <span>Pair</span>
          <span>Venue</span>
          <span>TVL</span>
          <span>APR</span>
          <span className="text-right">Action</span>
        </div>
        {pools.map((p) => (
          <div
            key={p.pair}
            className="grid grid-cols-2 items-center gap-y-3 border-t border-border px-6 py-5 transition hover:bg-foreground/[0.02] sm:grid-cols-[1.5fr_1fr_1fr_1fr_120px] sm:gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="h-6 w-6 rounded-full border border-border bg-foreground/10" />
                <span className="h-6 w-6 rounded-full border border-border bg-foreground/20" />
              </div>
              <span className="font-display text-base font-medium">{p.pair}</span>
            </div>
            <span className="text-sm text-muted-foreground sm:block">{p.venue}</span>
            <span className="font-display text-sm tabular-nums">{p.tvl}</span>
            <span className="font-display text-sm tabular-nums">{p.apr}</span>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 rounded-full border border-border px-4 py-2 text-center text-xs font-medium transition hover:bg-foreground/5 sm:col-span-1"
            >
              Open
            </a>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Pools;
