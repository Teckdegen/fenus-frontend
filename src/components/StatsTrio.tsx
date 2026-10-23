import { useEffect, useState } from "react";
import { fetchTVL, fmtUsdCompact } from "@/lib/tvl";

/* Three stat cards: dark, white, and gray — big numbers, small charts. */

const BreakdownBar = ({ invert }: { invert?: boolean }) => {
  const segs = [
    { pct: 83, label: "STOCKS 24" },
    { pct: 14, label: "ETFS 4" },
    { pct: 3, label: "COMM. 1" },
  ];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>100%</span>
      </div>
      <div className={`mt-2 flex h-9 w-full overflow-hidden rounded-lg ${invert ? "" : "border border-border"}`}>
        <div className="flex h-full items-center justify-center bg-foreground text-[10px] font-semibold text-background" style={{ width: "83%" }}>
          83%
        </div>
        <div className="h-full bg-foreground/60" style={{ width: "14%" }} />
        <div className="h-full bg-foreground/25" style={{ width: "3%" }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
        {segs.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${s.label.startsWith("STOCKS") ? "bg-foreground" : s.label.startsWith("ETFS") ? "bg-foreground/60" : "bg-foreground/25"}`} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const LineChart = () => (
  <svg viewBox="0 0 300 90" className="w-full" fill="none" aria-hidden>
    <line x1="0" y1="70" x2="300" y2="70" stroke="hsl(0 0% 9% / 0.08)" strokeWidth="1" />
    <line x1="0" y1="40" x2="300" y2="40" stroke="hsl(0 0% 9% / 0.08)" strokeWidth="1" />
    <line x1="0" y1="10" x2="300" y2="10" stroke="hsl(0 0% 9% / 0.08)" strokeWidth="1" />
    <path
      d="M10 68 C 60 60, 90 50, 130 38 S 210 16, 250 12 L 290 10"
      stroke="hsl(0 0% 9%)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="10" cy="68" r="4" fill="hsl(0 0% 100%)" stroke="hsl(0 0% 9%)" strokeWidth="2" />
    <circle cx="130" cy="38" r="4" fill="hsl(0 0% 100%)" stroke="hsl(0 0% 9%)" strokeWidth="2" />
    <circle cx="250" cy="12" r="4" fill="hsl(0 0% 100%)" stroke="hsl(0 0% 9%)" strokeWidth="2" />
    <circle cx="290" cy="10" r="5" fill="hsl(0 0% 9%)" />
  </svg>
);

const StatsTrio = () => {
  const [tvl, setTvl] = useState<string>("$0");

  useEffect(() => {
    let alive = true;
    fetchTVL()
      .then((d) => { if (alive) setTvl(fmtUsdCompact(d.tvl)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <section id="stats" className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">

          {/* dark card — global equity */}
          <article className="flex flex-col rounded-3xl bg-foreground p-8 text-background">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-background/60">
              GLOBAL EQUITY MARKET
            </p>
            <h3 className="mt-6 font-display text-5xl font-semibold tracking-tight">
              $110T
            </h3>
            <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-background/60">
              The markets FENUS tokenizes — real shares, real ETFs, real commodities.
            </p>
            <div className="mt-auto pt-10">
              <div className="flex h-24 items-end gap-2.5 border-b border-background/20 pb-0 text-[10px]">
                {[
                  { v: 88, l: "STOCKS" },
                  { v: 24, l: "ETF" },
                  { v: 14, l: "COMM." },
                ].map((b) => (
                  <div key={b.l} className="flex flex-1 flex-col items-center justify-end gap-2 h-full">
                    <div className="w-full rounded-sm bg-background/90" style={{ height: `${b.v}%` }} />
                    <span className="text-background/50">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* white card — live TVL */}
          <article className="flex flex-col rounded-3xl bg-card p-8 shadow-[0_1px_2px_hsl(0_0%_9%/0.05)] ring-1 ring-black/[0.06]">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground">
              FENUS TVL
            </p>
            <h3 className="mt-6 font-display text-5xl font-semibold tracking-tight">
              {tvl}
            </h3>
            <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-muted-foreground">
              Real value locked in FENUS vaults, live on LitVM right now.
            </p>
            <div className="mt-auto pt-10">
              <LineChart />
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Jul</span><span>Aug</span><span>Sep</span>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-foreground">Oct</span>
              </div>
            </div>
          </article>

          {/* gray card — asset coverage */}
          <article className="flex flex-col rounded-3xl bg-secondary/70 p-8">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground">
              TOKENIZED ASSETS
            </p>
            <h3 className="mt-6 font-display text-5xl font-semibold tracking-tight">
              29
            </h3>
            <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-muted-foreground">
              Stocks, ETFs and commodities live on LitVM — with more added every month.
            </p>
            <div className="mt-auto pt-10">
              <BreakdownBar />
            </div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default StatsTrio;
