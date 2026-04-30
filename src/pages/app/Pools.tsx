import { useState } from "react";
import { ArrowDown, Plus } from "lucide-react";
import {
  Card,
  PrimaryButton,
  GhostButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

// Pool definitions — hosted on Fenus UI, powered by Addax contracts
const pools = [
  { pair: "FnUSD / zkLTC", token0: "FnUSD", token1: "zkLTC", tvl: "$0", apr: "0.00%", myShare: "0.00%" },
  { pair: "FnUSD / USDC",  token0: "FnUSD", token1: "USDC",  tvl: "$0", apr: "0.00%", myShare: "0.00%" },
];

type Tab = "swap" | "add" | "remove";

const Pools = () => {
  const [activePool, setActivePool] = useState(0);
  const [tab, setTab] = useState<Tab>("swap");

  const pool = pools[activePool];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Pools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Swap and provide liquidity — hosted on Fenus, powered by Addax.
        </p>
      </div>

      {/* Protocol-level stats */}
      <Card className="p-5">
        <Row label="Total LP TVL"  value="$0" />
        <Row label="24h Volume"    value="$0" />
        <Row label="Your LP Value" value="$0" />
      </Card>

      {/* Pool selector */}
      <div>
        <SectionLabel>Select Pool</SectionLabel>
        <Card className="p-2">
          {pools.map((p, i) => (
            <button
              key={p.pair}
              onClick={() => { setActivePool(i); setTab("swap"); }}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-3.5 transition ${
                activePool === i
                  ? "bg-foreground/[0.07]"
                  : "hover:bg-foreground/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="h-9 w-9 rounded-full border-2 border-card bg-gradient-to-br from-foreground/80 to-foreground/30" />
                  <span className="h-9 w-9 rounded-full border-2 border-card bg-gradient-to-br from-foreground/40 to-foreground/10" />
                </div>
                <div className="text-left">
                  <p className="font-display text-sm font-medium">{p.pair}</p>
                  <p className="text-[11px] text-muted-foreground">Powered by Addax</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-sm tabular-nums">{p.apr} APR</p>
                <p className="text-[11px] tabular-nums text-muted-foreground">TVL {p.tvl}</p>
              </div>
            </button>
          ))}
        </Card>
      </div>

      {/* Active pool actions */}
      <div>
        <SectionLabel>{pool.pair}</SectionLabel>
        <Card className="p-4 space-y-4">

          {/* Tab switcher */}
          <div className="flex rounded-full bg-background/60 p-1">
            {(["swap", "add", "remove"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full px-4 py-2 text-xs font-medium capitalize transition ${
                  tab === t
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "add" ? "Add Liquidity" : t === "remove" ? "Remove" : "Swap"}
              </button>
            ))}
          </div>

          {/* Swap */}
          {tab === "swap" && (
            <div className="space-y-3">
              <TokenInput label="You pay"     symbol={pool.token0} balance="0.00" />
              <div className="flex justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </span>
              </div>
              <TokenInput label="You receive" symbol={pool.token1} balance="0.00" />
              <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
                <Row label="Rate"     value={`1 ${pool.token0} = 1.00 ${pool.token1}`} />
                <Row label="Fee"      value="0.30%" />
                <Row label="Impact"   value="0.00%" />
              </div>
              <div className="flex justify-end">
                <PrimaryButton>Swap</PrimaryButton>
              </div>
            </div>
          )}

          {/* Add Liquidity */}
          {tab === "add" && (
            <div className="space-y-3">
              <TokenInput label={pool.token0} symbol={pool.token0} balance="0.00" />
              <div className="flex justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </span>
              </div>
              <TokenInput label={pool.token1} symbol={pool.token1} balance="0.00" />
              <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
                <Row label="Your pool share" value="0.00%" />
                <Row label="LP tokens"       value="0.00" />
              </div>
              <div className="flex justify-end">
                <PrimaryButton>Add Liquidity</PrimaryButton>
              </div>
            </div>
          )}

          {/* Remove Liquidity */}
          {tab === "remove" && (
            <div className="space-y-3">
              <TokenInput label="LP tokens to remove" symbol="LP" balance="0.00" />
              <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
                <Row label={`${pool.token0} you receive`} value="0.00" />
                <Row label={`${pool.token1} you receive`} value="0.00" />
                <Row label="Your remaining share"         value="0.00%" />
              </div>
              <div className="flex justify-end">
                <GhostButton>Remove Liquidity</GhostButton>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Your positions */}
      <div>
        <SectionLabel>Your Positions</SectionLabel>
        <Card className="p-5">
          {pools.map((p) => (
            <Row key={p.pair} label={p.pair} value={p.myShare} hint="Pool share" />
          ))}
        </Card>
      </div>

      {/* Liquidation redistribution */}
      <div>
        <SectionLabel>Liquidation Redistribution</SectionLabel>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When a Trove is liquidated the protocol cancels the user's debt and
            distributes the seized collateral as follows: the debt amount is split
            50/50 between FnUSD and zkLTC and added to these liquidity pools to
            maintain the peg. Of the remaining surplus collateral, 60% goes to the
            protocol treasury and 40% is shared proportionally among all active
            Trove holders based on their collateral stake.
          </p>
          <div className="mt-4 space-y-0">
            <Row label="Debt to liquidity"        value="50% FnUSD + 50% zkLTC" hint="Added to pools above" />
            <Row label="Surplus to treasury"       value="60%"                   hint="Protocol revenue" />
            <Row label="Surplus to Trove holders"  value="40%"                   hint="Proportional to stake" />
            <Row label="Default Pool Collateral"   value="0.0000 zkLTC" />
            <Row label="Default Pool Debt"         value="0.00 FnUSD" />
            <Row label="Your Pending Coll. Gain"   value="0.0000 zkLTC" />
            <Row label="Your Pending Debt Absorbed" value="0.00 FnUSD" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pools;
