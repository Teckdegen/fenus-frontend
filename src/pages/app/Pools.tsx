import { ExternalLink } from "lucide-react";
import { Card, Row, SectionLabel } from "@/components/app/Shared";

const pools = [
  {
    pair: "FnUSD / zkLTC",
    venue: "Addax",
    tvl: "$0",
    apr: "0.00%",
    url: "https://addax.finance",
  },
  {
    pair: "FnUSD / USDC",
    venue: "Addax",
    tvl: "$0",
    apr: "0.00%",
    url: "https://addax.finance",
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
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl px-3 py-3.5 transition hover:bg-foreground/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="h-9 w-9 rounded-full border-2 border-card bg-gradient-to-br from-foreground/80 to-foreground/30" />
                  <span className="h-9 w-9 rounded-full border-2 border-card bg-gradient-to-br from-foreground/40 to-foreground/10" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium">{p.pair}</p>
                  <p className="text-[11px] text-muted-foreground">{p.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-display text-sm tabular-nums">{p.apr} APR</p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">TVL {p.tvl}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              </div>
            </a>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default Pools;
