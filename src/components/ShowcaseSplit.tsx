import { useEffect, useState } from "react";

/* Split section: sticky menu on the left, product visual on the right.
   The active row swaps the card inside the big soft-gray panel. */

type Tab = {
  key: string;
  label: string;
  title: string;
  body: string;
  cardLabel: string;
  cardValue: string;
  badge: string;
  bars: number[];
};

const TABS: Tab[] = [
  {
    key: "borrow",
    label: "Borrow",
    title: "Borrow",
    body: "Post tokenized stocks, ETFs or commodities as collateral and mint FnUSD against them. Your trove keeps its LTV live at every block.",
    cardLabel: "FnUSD Borrowed",
    cardValue: "1,000",
    badge: "ACTIVE",
    bars: [8, 10, 12, 15, 17, 20, 23, 27, 30, 34, 38, 43, 48, 53, 59, 64],
  },
  {
    key: "invest",
    label: "Invest",
    title: "Invest",
    body: "Lend FnUSD or provide liquidity and earn yield backed by real-world assets — not promises on a balance sheet.",
    cardLabel: "Vault Yield",
    cardValue: "6.2%",
    badge: "EARNING",
    bars: [20, 22, 21, 25, 27, 26, 30, 33, 35, 34, 39, 42, 45, 48, 52, 56],
  },
  {
    key: "trade",
    label: "Trade",
    title: "Trade",
    body: "Swap tokenized equities around the clock. Every asset tracks its real market price on-chain, 24/7 on LitVM.",
    cardLabel: "TSLA · Tokenized",
    cardValue: "$402.15",
    badge: "LIVE",
    bars: [56, 52, 48, 50, 44, 46, 40, 42, 36, 38, 32, 34, 28, 30, 24, 26],
  },
];

const BarChart = ({ bars, invert }: { bars: number[]; invert?: boolean }) => (
  <div className="flex h-24 items-end gap-1">
    {bars.map((h, i) => (
      <div
        key={i}
        className={`w-full rounded-sm ${invert ? "bg-foreground" : "bg-foreground/70"}`}
        style={{ height: `${h}%`, opacity: 0.35 + (i / bars.length) * 0.65 }}
      />
    ))}
  </div>
);

const ShowcaseSplit = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % TABS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const tab = TABS[active];

  return (
    <section className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 md:grid-cols-[minmax(0,300px)_1fr] md:gap-14">
        {/* left menu */}
        <div>
          {TABS.map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full border-t border-border py-6 text-left"
            >
              <span
                className={`font-display text-3xl font-semibold tracking-tight transition ${
                  i === active ? "text-foreground" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
          <div className="border-t border-border" />
        </div>

        {/* right panel */}
        <div className="rounded-[2rem] bg-secondary/70 px-6 py-12 sm:px-12 sm:py-16">
          <div className="rounded-3xl bg-card p-7 shadow-[0_1px_2px_hsl(0_0%_9%/0.05)] ring-1 ring-black/[0.06] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{tab.cardLabel}</span>
              <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold tracking-widest text-background">
                {tab.badge}
              </span>
            </div>
            <div className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {tab.cardValue}
            </div>
            <div className="mt-8">
              <BarChart bars={tab.bars} invert />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>1W</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-foreground">1M</span>
              <span>1Y</span>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            {tab.body}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSplit;
