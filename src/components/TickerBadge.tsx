import { useState } from "react";

type Props = {
  symbol: string;
  name: string;
  logo?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { badge: "h-14 w-14", img: "h-8 w-8", txt: "text-[10px]" },
  md: { badge: "h-16 w-16 sm:h-[72px] sm:w-[72px]", img: "h-9 w-9 sm:h-10 sm:w-10", txt: "text-[10px]" },
  lg: { badge: "h-20 w-20 sm:h-24 sm:w-24", img: "h-12 w-12 sm:h-14 sm:w-14", txt: "text-xs" },
};

/**
 * Coin-style ticker badge that shows the real company logo.
 * Tap / hover to reveal the full company name.
 */
const TickerBadge = ({ symbol, name, logo, size = "md" }: Props) => {
  const [open, setOpen] = useState(false);
  const [errored, setErrored] = useState(false);
  const s = sizeMap[size];

  return (
    <div className="relative flex shrink-0 flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`${symbol} — ${name}`}
        className={`${s.badge} group relative flex items-center justify-center overflow-hidden rounded-full border border-foreground/15 bg-gradient-to-br from-neutral-100 via-white to-neutral-300 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.6),0_10px_30px_-12px_hsl(0_0%_0%/0.9)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105 hover:border-foreground/40`}
      >
        {logo && !errored ? (
          <img
            src={logo}
            alt={`${symbol} logo`}
            loading="lazy"
            onError={() => setErrored(true)}
            className={`${s.img} object-contain`}
          />
        ) : (
          <span className={`${s.txt} font-display font-bold tracking-tight text-neutral-900`}>
            {symbol}
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"
        />
      </button>

      {/* Symbol chip permanently visible under the coin (small) */}
      <span className="mt-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground sm:text-[10px]">
        {symbol}
      </span>

      {/* Name tooltip on click/hover */}
      <div
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-6 whitespace-nowrap rounded-full border border-foreground/15 bg-background/95 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur-md transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
      >
        {name}
      </div>
    </div>
  );
};

export default TickerBadge;
