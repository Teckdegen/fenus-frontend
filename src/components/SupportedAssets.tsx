import { useState } from "react";
import { ALL_TICKERS, type Ticker } from "@/lib/tickers";
import TickerCard from "@/components/TickerCard";
import StockModal from "@/components/StockModal";

const SupportedAssets = () => {
  const [selected, setSelected] = useState<Ticker | null>(null);
  const total = ALL_TICKERS.length;
  const stocks = ALL_TICKERS.filter((t) => t.kind === "stock").length;
  const etfs = ALL_TICKERS.filter((t) => t.kind === "etf").length;
  const commodities = ALL_TICKERS.filter((t) => t.kind === "commodity").length;

  return (
    <section
      id="assets"
      className="relative isolate overflow-hidden border-t border-border bg-background py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
            Supported Assets
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Stocks, ETFs & commodities<br />
            <span className="text-muted-foreground">tokenized on LitVM.</span>
          </h2>
        </div>

        {/* count — mirrors the $110T treatment */}
        <div className="mt-14 text-center sm:mt-20">
          <div className="font-display text-[80px] leading-none tracking-tighter sm:text-[140px] md:text-[160px]">
            {total}+
          </div>
          <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground sm:text-xs">
            Assets Live at Launch
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
            <span><span className="font-semibold text-foreground">{stocks}</span> stocks</span>
            <span className="opacity-30">·</span>
            <span><span className="font-semibold text-foreground">{etfs}</span> ETFs</span>
            <span className="opacity-30">·</span>
            <span><span className="font-semibold text-foreground">{commodities}</span> commodities</span>
          </div>
          <p className="mx-auto mt-8 max-w-lg text-sm text-muted-foreground">
            Tap any asset to view its live price and chart.
          </p>
        </div>

        {/* grid — swipeable on mobile via native scroll, responsive on desktop */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {ALL_TICKERS.map((t) => (
            <TickerCard key={t.symbol} ticker={t} onSelect={setSelected} />
          ))}
        </div>
      </div>

      {selected && <StockModal ticker={selected} onClose={() => setSelected(null)} />}
    </section>
  );
};

export default SupportedAssets;
