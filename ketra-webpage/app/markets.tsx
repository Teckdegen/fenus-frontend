"use client";

import { useRef } from "react";

const stories = [
  {
    name: "Megacaps",
    image: "/art/megacap.svg",
    alt: "Rising pale bars over soft streaks of light",
    caption: "Apple, Microsoft, NVIDIA, Alphabet, Amazon, Meta and Tesla. The largest companies in the world, tokenized on LitVM.",
  },
  {
    name: "Semiconductors",
    image: "/art/chips.svg",
    alt: "A grid of glowing tiles in deep teal",
    caption: "Broadcom, TSMC, ASML, AMD, Micron, Qualcomm and Intel. Trade the chip cycle any hour of the day.",
  },
  {
    name: "AI and software",
    image: "/art/ai.svg",
    alt: "A bright price line climbing through violet light",
    caption: "Palantir, Oracle, Salesforce, Adobe, CoreWeave, Snowflake and more. Post them as collateral or trade them 24/7.",
  },
  {
    name: "ETFs",
    image: "/art/etfs.svg",
    alt: "Dark bars rising across a warm grey field",
    caption: "SPY, QQQ, VTI, SCHD, SMH, SGOV and BND. Broad market exposure in a single token.",
  },
  {
    name: "Commodities",
    image: "/art/commodities.svg",
    alt: "Gold candlesticks over amber streaks of light",
    caption: "Gold, silver and oil through GLD, SLV and USO. Real-world commodities, settled on chain.",
  },
  {
    name: "Space and defense",
    image: "/art/space.svg",
    alt: "Orbit rings and points of light on a night sky",
    caption: "SpaceX, Rocket Lab, AST SpaceMobile, Intuitive Machines, Lockheed Martin and more. Markets that never close.",
  },
];

export function Markets() {
  const scroller = useRef<HTMLDivElement>(null);

  function move(direction: number) {
    const el = scroller.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    const gap = 16;
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  }

  return (
    <section id="markets" className="relative z-10 mx-auto max-w-[1180px] scroll-mt-24 px-5 pt-6 pb-28 sm:px-8">
      <p className="text-[11px] font-medium tracking-[0.14em] text-[#a3a3a3] uppercase">Markets</p>
      <div className="mt-4 flex items-end justify-between gap-6">
        <div>
          <h2 className="max-w-[14ch] text-[26px] leading-[0.95] font-medium tracking-[-0.04em] text-black sm:text-[32px]">
            Real markets, open around the clock
          </h2>
        </div>
        <div className="mb-1 flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ececec] text-lg text-[#333] hover:bg-[#e4e4e4]"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ececec] text-lg text-[#333] hover:bg-[#e4e4e4]"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stories.map((story) => (
          <article key={story.name} className="relative h-[460px] w-[min(540px,82vw)] shrink-0 snap-start overflow-hidden rounded-[28px]">
            <img src={story.image} alt={story.alt} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />
            <p className="absolute top-5 right-5 left-5 max-w-[28ch] text-[15px] leading-tight font-semibold tracking-[-0.03em] text-white">{story.name}</p>
            <p className="absolute right-5 bottom-5 left-5 max-w-[36ch] text-[13px] leading-snug text-white">{story.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
