"use client";

import { useEffect, useState } from "react";
import { COUNTS, TVL_URL } from "./lib/fenus";

type TokenTvl = { symbol: string; value: number };
type TvlData = { tvl: number; tokens: TokenTvl[] };

// Same format as fmtUsdCompact in the FENUS app (src/lib/tvl.ts).
const fmtUsdCompact = (n: number): string => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

// World equity market cap, MacroMicro series for October 2026 ($163.9T).
// US share from the end-2025 count: $68.9T of $157.8T, about 44%.
const GLOBAL_MARKET = { label: "$163.9T", usPct: 44 };

export function Stats() {
  const [data, setData] = useState<TvlData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(TVL_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: TvlData) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const tokens = [...(data?.tokens ?? [])].sort((a, b) => b.value - a.value);
  const total = data?.tvl ?? 0;

  // Dark card: share of TVL held by the four largest positions, then the rest.
  const top = tokens.slice(0, 4).map((t) => ({ name: t.symbol, pct: total ? (t.value / total) * 100 : 0 }));
  const shares = data ? [...top, { name: "Other", pct: Math.max(0, 100 - top.reduce((s, t) => s + t.pct, 0)) }] : [];
  const maxPct = Math.max(10, Math.ceil(Math.max(0, ...shares.map((s) => s.pct)) / 10) * 10);

  const split = [
    { name: "Stocks", count: COUNTS.stock, fill: "#111" },
    { name: "ETFs", count: COUNTS.etf, fill: "#6a6a6a" },
    { name: "Commodities", count: COUNTS.commodity, fill: "#f7f7f7" },
  ];
  let offset = 8;
  const segments = split.map((s) => {
    const width = Math.max(4, (s.count / COUNTS.all) * 304);
    const seg = { ...s, x: offset, width };
    offset += width;
    return seg;
  });

  return (
    <section id="scale" className="relative z-10 scroll-mt-24 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-[1180px] items-stretch gap-4 lg:grid-cols-3">
        <article
          className="flex min-h-[520px] flex-col rounded-[28px] bg-[#161616] p-6 text-white"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        >
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase">FENUS TVL</p>
          <p className="mt-6 text-[42px] leading-none font-medium tracking-[-0.04em]">{data ? fmtUsdCompact(total) : "—"}</p>
          <p className="mt-4 max-w-[28ch] text-[14px] leading-6 text-white/80">
            Tokenized stocks, ETFs and commodities minted on LitVM, valued at live market prices.
          </p>
          <svg viewBox="0 0 320 168" className="mt-auto h-[168px] w-full" role="img" aria-label="Share of FENUS TVL by asset">
            <line x1="28" y1="18" x2="308" y2="18" stroke="rgba(255,255,255,0.12)" />
            <line x1="28" y1="68" x2="308" y2="68" stroke="rgba(255,255,255,0.12)" />
            <line x1="28" y1="118" x2="308" y2="118" stroke="rgba(255,255,255,0.28)" />
            <text x="0" y="22" fill="rgba(255,255,255,0.45)" fontSize="10">{maxPct}%</text>
            <text x="0" y="72" fill="rgba(255,255,255,0.45)" fontSize="10">{maxPct / 2}%</text>
            <text x="4" y="122" fill="rgba(255,255,255,0.45)" fontSize="10">0</text>
            {shares.map((share, index) => {
              const x = 58 + index * 54;
              const h = (share.pct / maxPct) * 100;
              return (
                <g key={share.name}>
                  <rect x={x - 14} y={118 - h} width="28" height={h} rx="3" fill="#f4f4f4" />
                  <text x={x} y={112 - h} textAnchor="middle" fill="#fff" fontSize="10">{Math.round(share.pct)}</text>
                  <text x={x} y="140" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10">{share.name}</text>
                </g>
              );
            })}
          </svg>
        </article>

        <article
          className="flex min-h-[520px] flex-col rounded-[28px] bg-white p-6 text-[#111]"
          style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        >
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase">Global stock market</p>
          <p className="mt-6 text-[42px] leading-none font-medium tracking-[-0.04em]">{GLOBAL_MARKET.label}</p>
          <p className="mt-4 max-w-[28ch] text-[14px] leading-6 text-[#8a8a8a]">
            The value of every listed company in the world. This is the market FENUS brings on chain.
          </p>
          <svg viewBox="0 0 320 168" className="mt-auto h-[168px] w-full" role="img" aria-label="Global stock market by region">
            <text x="8" y="36" fill="#9a9a9a" fontSize="10">0</text>
            <text x="292" y="36" fill="#9a9a9a" fontSize="10">100%</text>
            <line x1="8" y1="44" x2="312" y2="44" stroke="#dedede" />
            <rect x="8" y="58" width={(GLOBAL_MARKET.usPct / 100) * 304} height="36" rx="4" fill="#111" />
            <rect
              x={8 + (GLOBAL_MARKET.usPct / 100) * 304}
              y="58"
              width={((100 - GLOBAL_MARKET.usPct) / 100) * 304}
              height="36"
              rx="4"
              fill="#ececec"
            />
            <text x={8 + (GLOBAL_MARKET.usPct / 200) * 304} y="80" textAnchor="middle" fill="#fff" fontSize="12">
              {GLOBAL_MARKET.usPct}%
            </text>
            <rect x="8" y="116" width="8" height="8" rx="2" fill="#111" />
            <text x="22" y="124" fill="#111" fontSize="12">United States {GLOBAL_MARKET.usPct}%</text>
            <rect x="160" y="116" width="8" height="8" rx="2" fill="#ececec" stroke="#c8c8c8" />
            <text x="174" y="124" fill="#6d6d6d" fontSize="12">Rest of world {100 - GLOBAL_MARKET.usPct}%</text>
          </svg>
        </article>

        <article
          className="flex min-h-[520px] flex-col rounded-[28px] bg-[#e4e4e4] p-6 text-[#111]"
          style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        >
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase">Stocks listed</p>
          <p className="mt-6 text-[42px] leading-none font-medium tracking-[-0.04em]">{COUNTS.all}</p>
          <p className="mt-4 max-w-[28ch] text-[14px] leading-6 text-[#6d6d6d]">
            {COUNTS.stock} single stocks, {COUNTS.etf} ETFs and {COUNTS.commodity} commodities, live on LitVM.
          </p>
          <svg viewBox="0 0 320 168" className="mt-auto h-[168px] w-full" role="img" aria-label="FENUS assets by type">
            <text x="8" y="36" fill="#6d6d6d" fontSize="10">0</text>
            <text x="292" y="36" fill="#6d6d6d" fontSize="10">100%</text>
            <line x1="8" y1="44" x2="312" y2="44" stroke="#c8c8c8" />
            {segments.map((seg, index) => (
              <rect
                key={seg.name}
                x={seg.x}
                y="58"
                width={seg.width}
                height="36"
                rx={index === 1 ? 0 : 4}
                fill={seg.fill}
              />
            ))}
            <text x={8 + segments[0].width / 2} y="80" textAnchor="middle" fill="#fff" fontSize="12">
              {Math.round((COUNTS.stock / COUNTS.all) * 100)}%
            </text>
            {split.map((s, index) => {
              const x = [8, 108, 196][index];
              return (
                <g key={s.name}>
                  <rect x={x} y="116" width="8" height="8" rx="2" fill={s.fill} stroke={index === 2 ? "#c8c8c8" : undefined} />
                  <text x={x + 14} y="124" fill={index === 2 ? "#6d6d6d" : "#111"} fontSize="12">
                    {s.name} {s.count}
                  </text>
                </g>
              );
            })}
          </svg>
        </article>
      </div>
    </section>
  );
}
