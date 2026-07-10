import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_TICKERS, type Ticker } from "@/lib/tickers";
import TickerCard from "@/components/TickerCard";
import StockModal from "@/components/StockModal";

const SupportedAssets = () => {
  const [selected, setSelected] = useState<Ticker | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Roughly one "page" — 4 cards on desktop, 2 on mobile.
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section
      id="assets"
      className="relative isolate overflow-hidden border-t border-border bg-background py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
            Supported Assets
          </span>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Stocks, ETFs & commodities<br />
            <span className="text-muted-foreground">tokenized on LitVM.</span>
          </h2>
        </div>

        {/* Horizontal swipe carousel: 2 per view on mobile, 4 on desktop. */}
        <div className="relative mt-14 sm:mt-20">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/15 bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:border-foreground md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/15 bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:border-foreground md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollerRef}
            className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-4"
            style={{ scrollbarWidth: "none" }}
          >
            {ALL_TICKERS.map((t) => (
              <div
                key={t.symbol}
                className="shrink-0 snap-start basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-2.25rem)/4)]"
              >
                <TickerCard ticker={t} onSelect={setSelected} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && <StockModal ticker={selected} onClose={() => setSelected(null)} />}

      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
};

export default SupportedAssets;
