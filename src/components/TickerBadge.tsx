import { useState } from "react";

type Props = {
  symbol: string;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-14 w-14 text-[10px]",
  md: "h-16 w-16 text-[11px] sm:h-[72px] sm:w-[72px] sm:text-xs",
  lg: "h-20 w-20 text-xs sm:h-24 sm:w-24 sm:text-sm",
};

/**
 * Monochrome coin-style ticker badge. Click/tap to reveal the full company name.
 */
const TickerBadge = ({ symbol, name, size = "md" }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex shrink-0 flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`${symbol} — ${name}`}
        className={`${sizeMap[size]} group relative flex items-center justify-center rounded-full border border-foreground/15 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black font-display font-semibold text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08),0_10px_30px_-12px_hsl(0_0%_0%/0.9)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105 hover:border-foreground/40`}
      >
        <span className="tracking-tight">{symbol}</span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/5"
        />
      </button>

      {/* Name tooltip on click/hover */}
      <div
        role="tooltip"
        className={`pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-full border border-foreground/15 bg-background/95 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur-md transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
      >
        {name}
      </div>
    </div>
  );
};

export default TickerBadge;
