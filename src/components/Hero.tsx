import { ALL_TICKERS } from "@/lib/tickers";

const MARQUEE_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "NFLX",
  "AMD", "COIN", "SPY", "QQQ", "SLV", "SGOV", "AVGO", "MSTR",
];

/* decorative curved lines, like thin pen strokes across the page */
const CurvedLines = () => (
  <svg
    aria-hidden
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1920 900"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
  >
    <path d="M-100 120 C 420 260, 900 20, 1360 140 S 2000 220, 2120 90" stroke="hsl(0 0% 9% / 0.14)" strokeWidth="1.5" />
    <path d="M-100 260 C 380 420, 940 160, 1420 300 S 2020 380, 2120 260" stroke="hsl(0 0% 9% / 0.09)" strokeWidth="1.5" />
    <path d="M-100 640 C 500 520, 1100 780, 1500 660 S 2080 560, 2120 700" stroke="hsl(0 0% 9% / 0.10)" strokeWidth="1.5" />
    <path d="M-100 780 C 520 680, 1080 880, 1560 780 S 2060 700, 2120 820" stroke="hsl(0 0% 9% / 0.07)" strokeWidth="1.5" />
  </svg>
);

const MarqueeRow = () => (
  <div className="flex shrink-0 items-center gap-14 pr-14">
    {MARQUEE_TICKERS.map((sym) => {
      const t = ALL_TICKERS.find((x) => x.symbol === sym);
      if (!t) return null;
      return (
        <span key={sym} className="flex items-center gap-2.5">
          <img
            src={t.logo}
            alt=""
            aria-hidden
            loading="lazy"
            width={20}
            height={20}
            className="h-5 w-5 object-contain grayscale"
          />
          <span className="text-sm font-medium text-muted-foreground">{t.name.split(" ")[0]}</span>
        </span>
      );
    })}
  </div>
);

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <CurvedLines />

      {/* ── Hero text ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-10 pt-32 text-center sm:pt-36">
        <h1 className="font-display text-balance text-[2.9rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Borrow, Invest &amp; Trade
          <br />
          <span className="text-muted-foreground">tokenized stocks,</span>
          <br />
          commodities &amp; ETFs.
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          FENUS brings real-world equities on-chain. Post tokenized assets as
          collateral, mint FnUSD, and trade real markets 24/7 on LitVM.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://app.fenus.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Get started
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-[0_1px_2px_hsl(0_0%_9%/0.06)] ring-1 ring-black/5 transition hover:bg-accent"
          >
            Docs
          </a>
        </div>
      </div>

      {/* ── grayscale logo marquee ── */}
      <div className="relative z-10 pb-12">
        <div
          className="relative flex w-full overflow-hidden py-4"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee">
            <MarqueeRow />
            <MarqueeRow />
            <MarqueeRow />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
