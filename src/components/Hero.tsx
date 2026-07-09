import { ALL_TICKERS } from "@/lib/tickers";
import TickerBadge from "@/components/TickerBadge";

const Hero = () => {
  // Two rows for the hero, opposite directions
  const rowA = [...ALL_TICKERS.slice(0, 13), ...ALL_TICKERS.slice(0, 13), ...ALL_TICKERS.slice(0, 13)];
  const rowB = [...ALL_TICKERS.slice(12), ...ALL_TICKERS.slice(12), ...ALL_TICKERS.slice(12)];

  return (
    <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-32 pb-16">
      {/* soft radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_10%)_0%,hsl(0_0%_0%)_70%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <p className="mb-6 font-display text-[10px] tracking-[0.5em] text-muted-foreground sm:text-xs">
          FENUS · LITVM
        </p>
        <h1 className="font-display text-balance text-3xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
          Borrow, Invest, and Trade<br />
          <span className="text-muted-foreground">tokenized stocks, commodities & ETFs</span><br />
          on LitVM.
        </h1>
      </div>

      {/* Two scrolling ticker rows — opposite directions */}
      <div className="relative z-10 mt-16 w-full space-y-4 sm:mt-20 sm:space-y-5">
        <TickerRow items={rowA} direction="left" />
        <TickerRow items={rowB} direction="right" />
      </div>
    </section>
  );
};

const TickerRow = ({
  items,
  direction,
}: {
  items: { symbol: string; name: string }[];
  direction: "left" | "right";
}) => (
  <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    <div
      className={`flex w-max gap-3 sm:gap-4 ${
        direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
      } group-hover:[animation-play-state:paused]`}
    >
      {items.map((t, i) => (
        <TickerBadge key={`${t.symbol}-${i}`} symbol={t.symbol} name={t.name} />
      ))}
    </div>
  </div>
);

export default Hero;
