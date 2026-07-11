import { useEffect, useRef, useState } from "react";
import { ALL_TICKERS, type Ticker } from "@/lib/tickers";
import TickerCard from "@/components/TickerCard";
import StockModal from "@/components/StockModal";

const SupportedAssets = () => {
  const [selected, setSelected] = useState<Ticker | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const recomputePages = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const pages = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPageCount(pages);
    setActivePage(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    recomputePages();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      setActivePage(Math.round(el.scrollLeft / el.clientWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recomputePages);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recomputePages);
    };
  }, []);

  const goToPage = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goToPage(Math.min(pageCount - 1, activePage + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPage(Math.max(0, activePage - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      goToPage(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToPage(pageCount - 1);
    }
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

        {/* Horizontal swipe carousel with snap + keyboard nav. */}
        <div className="relative mt-14 sm:mt-20">
          <div
            ref={scrollerRef}
            role="region"
            aria-label="Supported assets carousel"
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 sm:gap-4"
            style={{ scrollbarWidth: "none", touchAction: "pan-x" }}
          >
            {ALL_TICKERS.map((t, i) => (
              <div
                key={t.symbol}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${ALL_TICKERS.length}: ${t.symbol}`}
                className="shrink-0 snap-start basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-2.25rem)/4)]"
              >
                <TickerCard ticker={t} onSelect={setSelected} />
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div
              role="tablist"
              aria-label="Carousel pages"
              className="mt-6 flex items-center justify-center gap-2"
            >
              {Array.from({ length: pageCount }).map((_, i) => {
                const active = i === activePage;
                return (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={active}
                    aria-label={`Go to page ${i + 1}`}
                    onClick={() => goToPage(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      active
                        ? "w-8 bg-foreground"
                        : "w-2 bg-foreground/25 hover:bg-foreground/50"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected && <StockModal ticker={selected} onClose={() => setSelected(null)} />}

      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
};

export default SupportedAssets;
