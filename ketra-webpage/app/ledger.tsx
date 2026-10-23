"use client";

import { useState } from "react";
import { stockLogo } from "./lib/fenus";

const tabs = [
  {
    id: "borrow",
    title: "Borrow",
    body: "Lock wzkLTC in a Trove and mint FnUSD against it. 0% interest, a one-time 0.5% fee, and a 135% collateral ratio.",
    link: "Open a Trove",
  },
  {
    id: "trade",
    title: "Trade",
    body: "Buy and sell tokenized stocks, ETFs and commodities with FnUSD. The market does not close at 4pm.",
    link: "Trade 24/7",
  },
  {
    id: "network",
    title: "Network",
    body: "Everything settles on LitVM, the EVM chain secured by Litecoin. wzkLTC pays the gas.",
    link: "LitVM",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

const ranges = ["1W", "1M", "1Y"] as const;

function barsFor(range: (typeof ranges)[number]) {
  const count = range === "1W" ? 16 : range === "1M" ? 36 : 56;
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return 8 + Math.round(Math.pow(t, 1.45) * 92);
  });
}

export function Ledger() {
  const [tab, setTab] = useState<TabId>("borrow");
  const [range, setRange] = useState<(typeof ranges)[number]>("1M");
  const bars = barsFor(range);
  const axis =
    range === "1W" ? ["Mon", "Today"] : range === "1M" ? ["Aug", "Today"] : ["2025", "Today"];

  return (
    <section id="ledger" className="relative z-10 mx-auto max-w-[1180px] scroll-mt-24 px-5 pt-8 pb-28 sm:px-8">
      <div className="grid items-stretch gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
        <div className="flex flex-col border-t border-[#e6e6e6]">
          {tabs.map((item) => {
            const open = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="border-b border-[#e6e6e6] py-7 text-left"
              >
                <span className={`block text-[22px] leading-none font-medium tracking-[-0.03em] ${open ? "text-black" : "text-[#c8c8c8]"}`}>
                  {item.title}
                </span>
                {open ? (
                  <>
                    <span className="mt-3 block max-w-[280px] text-[13px] leading-5 text-[#6d6d6d]">{item.body}</span>
                    <span className="mt-4 block text-[13px] text-[#9a9a9a]">
                      {item.link} <span className="text-[#c8c8c8]">›</span>
                    </span>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-[560px] items-center justify-center rounded-[32px] bg-[#ececec] px-6 py-10">
          {tab === "borrow" ? (
            <div className="w-full max-w-[460px] rounded-[24px] bg-white px-6 pt-5 pb-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between">
                <p className="text-[13px] text-[#8a8a8a]">FnUSD borrowed</p>
                <span className="rounded-full bg-[#e7f8ef] px-2 py-0.5 text-[12px] font-medium text-[#1f9d62]">212% safe</span>
              </div>
              <p className="mt-2 text-[28px] leading-none font-medium tracking-[-0.04em] text-black">1,000</p>
              <div className="mt-8 flex h-[120px] items-end gap-[3px]">
                {bars.map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-[1px] bg-[#c4b6f6]"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[12px] text-[#b0b0b0]">
                <span>{axis[0]}</span>
                <span>{axis[1]}</span>
              </div>
              <div className="mt-4 flex gap-2">
                {ranges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRange(item)}
                    className={`rounded-full px-3 py-1 text-[13px] ${
                      range === item ? "bg-[#f3f3f3] font-medium text-black" : "text-[#b0b0b0]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "trade" ? (
            <div className="w-full max-w-[340px] rounded-[24px] bg-white px-4 pt-4 pb-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between px-1">
                <p className="text-[13px] text-[#8a8a8a]">Buy</p>
                <span className="flex items-center gap-1.5 text-[12px] text-[#1f9d62]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1f9d62]" />
                  Market open
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-[#efefef] px-4 py-3">
                <p className="text-[12px] text-[#b0b0b0]">You pay</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[28px] leading-none font-medium tracking-[-0.04em]">500</p>
                  <span className="text-[12px] font-medium text-[#6d6d6d]">FnUSD</span>
                </div>
              </div>
              <div className="mt-2 rounded-2xl border border-[#efefef] px-4 py-3">
                <p className="text-[12px] text-[#b0b0b0]">You get</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[28px] leading-none font-medium tracking-[-0.04em]">1.43</p>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6d6d6d]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={stockLogo("AAPL")} alt="" className="h-4 w-4 object-contain" />
                    AAPL
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-2xl bg-[#f6f6f6] px-4 py-3 text-[12px] text-[#8a8a8a]">
                <span>Saturday, 3:12 am</span>
                <span>Filled</span>
              </div>
              <div className="mt-3 rounded-full bg-black py-3 text-center text-[14px] font-medium text-white">Buy AAPL</div>
            </div>
          ) : null}

          {tab === "network" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-[56px] leading-none font-bold tracking-[-0.05em] italic text-black">LitVM</span>
              <span className="text-[13px] text-[#8a8a8a]">Chain id 4441 · gas in wzkLTC</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
