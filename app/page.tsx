import { Ledger } from "./ledger";
import { Markets } from "./markets";
import { Stats } from "./stats";
import { APP_URL, COUNTS, TOP_STOCKS, X_URL } from "./lib/fenus";

const links = [
  { href: "#product", label: "Product" },
  { href: "#ledger", label: "Borrow" },
  { href: "#markets", label: "Markets" },
  { href: "#scale", label: "Stats" },
  { href: "/docs", label: "Docs" },
];

const orbit = TOP_STOCKS.slice(0, 5);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f4f4f4] text-[#111]">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[220px] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMin meet"
        fill="none"
      >
        <path d="M-160 8C180 150 620 176 900 92C1180 8 1360 70 1620 -20" stroke="#c6c6c6" strokeWidth="2.3" />
        <path d="M-180 36C160 178 600 204 900 118C1200 32 1380 98 1640 6" stroke="#c6c6c6" strokeWidth="2.3" />
        <path d="M980 -30C1120 70 1280 20 1460 90C1580 136 1660 40 1760 110" stroke="#c6c6c6" strokeWidth="2.3" />
        <path className="hero-line-a" pathLength="1000" d="M-160 8C180 150 620 176 900 92C1180 8 1360 70 1620 -20" stroke="#8a8a8a" strokeWidth="2.7" />
        <path className="hero-line-b" pathLength="1000" d="M-180 36C160 178 600 204 900 118C1200 32 1380 98 1640 6" stroke="#8a8a8a" strokeWidth="2.7" />
      </svg>
      <header className="sticky top-0 z-30 flex justify-center bg-transparent px-4 py-4 sm:py-5">
        <nav className="flex max-w-full items-center gap-1 rounded-full bg-[#ececec] py-1.5 pr-1.5 pl-4 sm:gap-2 sm:pl-5">
          <a href="#top" className="mr-2 text-[13px] font-bold tracking-[-0.04em] italic sm:mr-4">
            FENUS
          </a>
          <div className="hidden items-center md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-[13px] font-medium text-[#1c1c1c] hover:bg-black/5"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-[#222] sm:px-4 sm:py-2"
          >
            Launch App
          </a>
        </nav>
      </header>
      <div className="relative flex min-h-[calc(100vh-88px)] flex-col overflow-hidden">
      <main id="top" className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6">
        <div className="flex flex-1 flex-col items-center justify-center pt-24 pb-8 text-center sm:pt-32">
          <h1 className="text-[2.5rem] leading-[0.95] font-medium tracking-[-0.04em] text-black sm:text-[3.45rem]">
            Tokenized Stocks,
            <br />
            Onchain 24/7
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 font-normal text-[#8a8a8a]">
            FENUS brings {COUNTS.stock} real-world stocks, {COUNTS.etf} ETFs and {COUNTS.commodity} commodities on chain. Borrow FnUSD against wzkLTC and trade them on LitVM, any hour of any day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-[#222]"
            >
              Get started
            </a>
            <a
              href="/docs"
              className="rounded-full bg-[#e6e6e6] px-4 py-2 text-[13px] font-medium text-black hover:bg-[#dedede]"
            >
              Docs
            </a>
          </div>
        </div>

      </main>
      <div className="relative z-10 w-full min-w-0 overflow-hidden pb-12">
        <div className="logo-marquee flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {Array.from({ length: 2 }, (_, repeat) =>
                TOP_STOCKS.map((mark) => (
                  <li key={`${repeat}-${mark.symbol}`} className="flex shrink-0 items-center gap-1.5 pr-10 text-[#9a9a9a]">
                    <img src={mark.logo} alt="" className="h-7 w-7 object-contain opacity-70 grayscale" />
                    <span className="text-[10px] font-medium tracking-[-0.02em] whitespace-nowrap">{mark.name}</span>
                  </li>
                )),
              )}
            </ul>
          ))}
        </div>
      </div>
      </div>

      <section id="product" className="relative z-10 mx-auto max-w-[1180px] scroll-mt-24 px-5 pt-8 pb-12 sm:px-8">
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          <article id="collateral" className="flex flex-col overflow-hidden rounded-[28px] bg-white px-6 pt-6">
            <h3 className="text-[14px] font-semibold tracking-[-0.01em]">
              Lock wzkLTC <span className="text-[#c8c8c8]">›</span>
            </h3>
            <p className="mt-2 max-w-[34ch] text-[13px] leading-[1.45] text-[#8d8d8d]">
              Wrapped Litecoin goes into a Trove. It stays yours, and it backs everything you borrow.
            </p>
            <div className="relative mt-3 h-[300px]">
              <div
                className="dot-drift absolute inset-x-[-8%] bottom-[-18%] h-[118%]"
                style={{
                  backgroundImage: "radial-gradient(#b5b5b5 1.25px, transparent 1.4px)",
                  backgroundSize: "11px 11px",
                  maskImage: "radial-gradient(circle at 50% 62%, #000 26%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(circle at 50% 62%, #000 26%, transparent 70%)",
                }}
              />
              <span className="pulse-ring absolute bottom-[38%] left-1/2 h-16 w-16 rounded-full border border-[#111]" />
              <span className="pulse-ring absolute bottom-[38%] left-1/2 h-16 w-16 rounded-full border border-[#111] [animation-delay:1.4s]" />
              <span className="absolute bottom-[34%] left-1/2 z-10 -translate-x-1/2 rounded-md bg-black px-2.5 py-1 text-[12px] font-medium text-white">
                wzkLTC
              </span>
            </div>
          </article>

          <article id="mint" className="flex flex-col overflow-hidden rounded-[28px] bg-white px-6 pt-6">
            <h3 className="text-[14px] font-semibold tracking-[-0.01em]">
              Mint FnUSD <span className="text-[#c8c8c8]">›</span>
            </h3>
            <p className="mt-2 max-w-[36ch] text-[13px] leading-[1.45] text-[#8d8d8d]">
              Borrow the FENUS stablecoin at 0% interest. Keep your collateral ratio at 135% or higher.
            </p>
            <div className="relative mt-3 h-[300px]">
              <div className="sheet-float absolute top-4 right-8 left-10 flex h-12 items-center rounded-2xl border border-[#f3f3f3] bg-[#fafafa] px-5 text-[11px] font-medium tracking-[0.18em] text-[#d0d0d0]">
                COLLATERAL
              </div>
              <div className="sheet-float absolute top-[58px] right-5 left-6 flex h-[52px] items-center rounded-2xl border border-[#eee] bg-[#fcfcfc] px-5 text-[11px] font-medium tracking-[0.18em] text-[#bdbdbd] [animation-delay:0.4s]">
                135% RATIO
              </div>
              <div className="sheet-float absolute top-[104px] right-1 left-1 flex h-14 items-center rounded-2xl border border-[#ececec] bg-white px-5 text-[12px] font-medium tracking-[0.18em] text-[#a3a3a3] shadow-[0_10px_24px_rgba(0,0,0,0.05)] [animation-delay:0.8s]">
                0% INTEREST
              </div>
              <svg viewBox="0 0 320 120" className="absolute right-3 bottom-3 left-3 h-[108px] w-[calc(100%-24px)]" aria-hidden="true">
                <path className="sig-draw" d="M16 96 C 70 96, 120 64, 168 46 S 250 18, 292 16" fill="none" stroke="#111" strokeWidth="1.6" />
                <circle cx="292" cy="16" r="3.4" fill="#111" />
                <text x="226" y="14" fill="#111" fontSize="13" fontFamily="inherit">
                  FnUSD
                </text>
              </svg>
            </div>
          </article>

          <article id="trade" className="flex flex-col overflow-hidden rounded-[28px] bg-white px-6 pt-6">
            <h3 className="text-[14px] font-semibold tracking-[-0.01em]">
              Trade real markets <span className="text-[#c8c8c8]">›</span>
            </h3>
            <p className="mt-2 max-w-[38ch] text-[13px] leading-[1.45] text-[#8d8d8d]">
              Apple, Microsoft, NVIDIA, Alphabet, Amazon and {COUNTS.all - 5} more assets. Buy with FnUSD at any hour.
            </p>
            <div className="relative mt-3 h-[300px]">
              <div className="absolute top-1/2 left-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#eee]" />
              <span className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-white">
                FENUS
              </span>
              <div className="orbit-spin absolute top-1/2 left-1/2 h-0 w-0">
                {orbit.map((mark, index) => (
                  <span
                    key={mark.symbol}
                    className="absolute"
                    style={{ transform: `rotate(${index * 72}deg) translateY(-112px)` }}
                  >
                    <span className="absolute -translate-x-1/2 -translate-y-1/2">
                      <span className="orbit-spin-reverse flex h-9 w-9 items-center justify-center rounded-full border border-[#eee] bg-white">
                        <img src={mark.logo} alt={mark.name} className="h-5 w-5 object-contain" />
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <Ledger />
      <Markets />
      <Stats />

      <section id="basics" className="relative z-10 mx-auto max-w-[1180px] scroll-mt-24 px-5 pt-4 pb-28 sm:px-8">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#a3a3a3] uppercase">How it works</p>
        <h2 className="mt-4 max-w-[14ch] text-[26px] leading-[0.95] font-medium tracking-[-0.04em] text-black sm:text-[32px]">
          Collateral in, markets out
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <article>
            <div className="relative h-[210px] overflow-hidden rounded-[22px] sm:h-[230px]">
              <img src="/art/collateral.svg" alt="Rings of pale light around a dark center" className="h-full w-full object-cover" />
              <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9]/90 text-[#333]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M9.2 9.2 L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <h3 className="mt-4 text-[14px] leading-snug font-semibold tracking-[-0.02em]">Deposit wzkLTC</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#8a8a8a]">
              Open a Trove and lock wrapped Litecoin as collateral. Add more at any time to push your ratio up.
            </p>
            <p className="mt-4 text-[11px] font-medium tracking-[0.14em] text-[#b0b0b0] uppercase">Collateral</p>
          </article>
          <article>
            <div className="relative h-[210px] overflow-hidden rounded-[22px] sm:h-[230px]">
              <img src="/art/mint.svg" alt="A bright price line over dark blue streaks of light" className="h-full w-full object-cover" />
              <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9]/90 text-[#333]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2 V12 M2 7 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <h3 className="mt-4 text-[14px] leading-snug font-semibold tracking-[-0.02em]">Mint FnUSD</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#8a8a8a]">
              Borrow FnUSD against your Trove with 0% interest and a one-time 0.5% fee. Repay whenever you like.
            </p>
            <p className="mt-4 text-[11px] font-medium tracking-[0.14em] text-[#b0b0b0] uppercase">Borrow</p>
          </article>
          <article>
            <div className="relative h-[210px] overflow-hidden rounded-[22px] sm:h-[230px]">
              <img src="/art/trade.svg" alt="Candlesticks over green and gold streaks of light" className="h-full w-full object-cover" />
              <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9]/90 text-[#333]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M7 4.2 V7.2 L9 8.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <h3 className="mt-4 text-[14px] leading-snug font-semibold tracking-[-0.02em]">Trade tokenized stocks</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#8a8a8a]">
              Use FnUSD to buy stocks, ETFs and commodities on LitVM. Hold them, sell them, or post them as collateral.
            </p>
            <p className="mt-4 text-[11px] font-medium tracking-[0.14em] text-[#b0b0b0] uppercase">Trade</p>
          </article>
        </div>
      </section>

      <footer id="contact" className="relative z-10 mx-auto max-w-[1180px] px-5 pt-4 pb-10 sm:px-8">
        <div className="flex items-center justify-between gap-6 rounded-[28px] bg-white px-6 py-6 sm:px-12 sm:py-10">
          <span className="text-[15px] font-bold tracking-[-0.04em] italic">FENUS</span>
          <div className="flex items-center gap-3">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-[#222]"
            >
              Launch App
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e4e4e4] text-[#111] hover:bg-[#f4f4f4]"
              aria-label="FENUS on X"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

