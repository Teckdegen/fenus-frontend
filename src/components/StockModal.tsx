import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchHistory, fetchQuote, HISTORY_DAYS, type HistPoint, type Quote } from "@/lib/stockApi";
import type { Ticker } from "@/lib/tickers";

type Props = {
  ticker: Ticker;
  onClose: () => void;
};

const fmt = (n: number | null | undefined, d = 2) =>
  n == null || !isFinite(n) ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const StockModal = ({ ticker, onClose }: Props) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hist, setHist] = useState<HistPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setQuote(null);
    setHist(null);
    setErr(null);
    Promise.all([fetchQuote(ticker.symbol), fetchHistory(ticker.symbol, HISTORY_DAYS)])
      .then(([q, h]) => { if (alive) { setQuote(q); setHist(h); } })
      .catch(() => { if (alive) setErr("Live data unavailable for this asset."); });
    return () => { alive = false; };
  }, [ticker.symbol]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const up = (quote?.changePct ?? 0) >= 0;

  // Evenly-spaced Y-axis ticks — Recharts' default "nice" ticks clamp the
  // first/last tick to the exact dataMin/dataMax, which reads as uneven
  // (e.g. $267, $287, $316) instead of a consistent price scale.
  const yTicks = useMemo(() => {
    if (!hist || hist.length === 0) return undefined;
    const values = hist.map((h) => h.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min];
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => min + ((max - min) * i) / steps);
  }, [hist]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-foreground/15 bg-background shadow-[0_30px_80px_-20px_hsl(0_0%_0%/0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 bg-background/80 text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4 border-b border-border p-5 sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/15 bg-gradient-to-br from-neutral-100 via-white to-neutral-300 shadow-inner">
            {ticker.logo ? (
              <img src={ticker.logo} alt="" className="h-8 w-8 object-contain" />
            ) : (
              <span className="font-display text-xs font-bold text-neutral-900">{ticker.symbol}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="font-display text-xl font-semibold tracking-tight">{ticker.symbol}</h3>
              <span className="truncate text-sm text-muted-foreground">{ticker.name}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {quote ? `$${fmt(quote.price)}` : err ? "—" : "…"}
              </span>
              {quote && quote.changePct != null && (
                <span className={`text-sm font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
                  {up ? "▲" : "▼"} {fmt(Math.abs(quote.change ?? 0))} ({fmt(Math.abs(quote.changePct))}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="h-[280px] w-full p-3 sm:h-[340px] sm:p-5">
          {err && (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {err}
            </div>
          )}
          {!err && !hist && (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Loading chart…
            </div>
          )}
          {hist && hist.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hist} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis
                  domain={["dataMin", "dataMax"]}
                  ticks={yTicks}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  width={44}
                  tickFormatter={(v) => `$${Math.round(v)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  labelFormatter={(label: string) => fmtDate(label)}
                  formatter={(v: number) => [`$${fmt(v)}`, "Close"]}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.75}
                  fill="url(#chartFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border p-4 text-center sm:grid-cols-4 sm:p-5">
          <Stat label="Type" value={ticker.kind.toUpperCase()} />
          {ticker.founded && <Stat label="Founded" value={String(ticker.founded)} />}
          {ticker.hq && <Stat label="HQ" value={ticker.hq} />}
          {ticker.sector && <Stat label="Sector" value={ticker.sector} />}
          {ticker.ceo && <Stat label="CEO" value={ticker.ceo} />}
          <Stat label="Currency" value={quote?.currency ?? "USD"} />
        </div>

        {ticker.about && (
          <div className="border-t border-border px-5 py-4 sm:px-6">
            <div className="text-[9px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">About</div>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{ticker.about}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[9px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">{label}</div>
    <div className="mt-1 text-sm font-medium">{value}</div>
  </div>
);

export default StockModal;
