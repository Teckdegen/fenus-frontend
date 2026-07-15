import { Wallet, TrendingUp, Globe2, Shield, Coins, Building2 } from "lucide-react";

const CASES = [
  {
    icon: Wallet,
    kicker: "01 — Liquidity without exit",
    title: "Unlock cash without selling your LTC",
    body: "Lock zkLTC as collateral, mint FnUSD, and keep every satoshi of upside. Repay anytime — your position is yours until you close it.",
  },
  {
    icon: TrendingUp,
    kicker: "02 — Tokenized markets",
    title: "Trade equities, ETFs & commodities onchain",
    body: "Apple, Tesla, gold, oil — settled 24/7 on LitVM with FnUSD. No brokerage, no market hours, no permission.",
  },
  {
    icon: Globe2,
    kicker: "03 — A borderless dollar",
    title: "Hold and move FnUSD anywhere",
    body: "A censorship-resistant stable dollar issued against Litecoin. Send it, save in it, price your product in it — no bank required.",
  },
  {
    icon: Building2,
    kicker: "04 — DAO & treasury",
    title: "Productive collateral for DAOs",
    body: "Treasuries can borrow against LTC reserves to fund operations without liquidating the underlying asset or triggering a taxable event.",
  },
  {
    icon: Coins,
    kicker: "05 — Yield & liquidity",
    title: "Provide liquidity, earn protocol flow",
    body: "Supply FnUSD to stability and AMM pools. Absorb liquidations, earn fees, compound the growth of the LitVM economy.",
  },
  {
    icon: Shield,
    kicker: "06 — Leverage LTC exposure",
    title: "Loop collateral, amplify conviction",
    body: "Mint FnUSD, swap for more zkLTC, redeposit. A transparent, overcollateralized way to express a bullish view on Litecoin.",
  },
];

const UseCases = () => {
  return (
    <section className="relative border-t border-border/60 bg-background py-24 sm:py-32">
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(0_0%_100%)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 font-display text-[10px] tracking-[0.5em] text-muted-foreground">
              USE CASES
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Built for the way <br />
              <span className="text-muted-foreground">money should move.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-right">
            FENUS turns Litecoin into productive collateral and opens the door to a
            24/7 onchain economy — from a stable dollar to tokenized global markets.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map(({ icon: Icon, kicker, title, body }) => (
            <div
              key={title}
              className="group relative flex flex-col justify-between gap-10 bg-background p-8 transition-colors duration-500 hover:bg-secondary/40 sm:p-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/80 bg-secondary/60 transition-colors duration-500 group-hover:border-foreground/40">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">
                  {kicker}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>

              {/* corner accent */}
              <div
                aria-hidden
                className="absolute right-0 top-0 h-px w-0 bg-foreground/60 transition-all duration-500 group-hover:w-16"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
