import { ALL_TICKERS } from "@/lib/tickers";
import TickerBadge from "@/components/TickerBadge";

/**
 * 4 scrolling rows of supported assets, alternating direction.
 * Distribution is roughly balanced across rows.
 */
const chunk = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => out[i % n].push(item));
  return out;
};

const SupportedAssets = () => {
  const rows = chunk(ALL_TICKERS, 4);

  return (
    <section
      id="assets"
      className="relative isolate overflow-hidden bg-background py-28 sm:py-36"
    >
      <div className="relative z-10 mx-auto mb-14 max-w-4xl px-6 text-center sm:mb-20">
        <span className="mb-5 inline-block rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
          Supported Assets
        </span>
        <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">
          Stocks, ETFs & commodities<br />
          <span className="text-muted-foreground">tokenized on LitVM.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Tap any asset to reveal its name.
        </p>
      </div>

      <div className="relative z-10 space-y-5 sm:space-y-6">
        {rows.map((row, idx) => {
          const loop = [...row, ...row, ...row, ...row];
          const direction = idx % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse";
          const speed = idx % 2 === 0 ? "[animation-duration:38s]" : "[animation-duration:44s]";
          return (
            <div
              key={idx}
              className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
            >
              <div
                className={`flex w-max gap-3 sm:gap-4 ${direction} ${speed} group-hover:[animation-play-state:paused]`}
              >
                {loop.map((t, i) => (
                  <TickerBadge key={`${idx}-${t.symbol}-${i}`} symbol={t.symbol} name={t.name} size="md" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SupportedAssets;
