import { useEffect, useState } from "react";
import type { Ticker } from "@/lib/tickers";
import { fetchQuote, type Quote } from "@/lib/stockApi";

type Props = {
  ticker: Ticker;
  onSelect: (t: Ticker) => void;
};

const fmt = (n: number, d = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * Square, tappable card with logo, symbol, name and live price.
 */
const TickerCard = ({ ticker, onSelect }: Props) => {
  const [q, setQ] = useState<Quote | null>(null);
  const [failed, setFailed] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchQuote(ticker.symbol)
      .then((qq) => alive && setQ(qq))
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [ticker.symbol]);

  const up = (q?.changePct ?? 0) >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(ticker)}
      className="group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[0_20px_50px_-20px_hsl(0_0%_100%/0.15)] sm:p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-foreground/15 bg-gradient-to-br from-neutral-100 via-white to-neutral-300 shadow-inner sm:h-10 sm:w-10">
          {ticker.logo && !logoErr ? (
            <img
              src={ticker.logo}
              alt=""
              loading="lazy"
              onError={() => setLogoErr(true)}
              className="h-5 w-5 object-contain sm:h-6 sm:w-6"
            />
          ) : (
            <span className="text-[8px] font-bold tracking-tight text-neutral-900">{ticker.symbol}</span>
          )}
        </div>
        <span className="rounded-full border border-foreground/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {ticker.kind}
        </span>
      </div>

      <div>
        <div className="font-display text-base font-semibold tracking-tight sm:text-lg">
          {ticker.symbol}
        </div>
        <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
          {ticker.name}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1">
        <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
          {q ? `$${fmt(q.price ?? 0)}` : failed ? "—" : "···"}
        </span>
        {q && q.changePct != null && (
          <span className={`text-[10px] font-medium sm:text-xs ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? "▲" : "▼"} {fmt(Math.abs(q.changePct))}%
          </span>
        )}
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5"
      />
    </button>
  );
};

export default TickerCard;
