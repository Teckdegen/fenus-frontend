"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { APP_URL, COUNTS, EXPLORER, X_URL, stockLogo } from "../lib/fenus";
import { TOKEN_REGISTRY, type TokenKind } from "../lib/tokenRegistry";

const toc = [
  { id: "start", label: "Start here" },
  { id: "fenus", label: "What is FENUS" },
  { id: "trove", label: "Troves" },
  { id: "fnusd", label: "FnUSD" },
  { id: "ratio", label: "Collateral ratio" },
  { id: "fees", label: "Fees" },
  { id: "borrow", label: "Borrowing FnUSD" },
  { id: "trade", label: "Trading stocks" },
  { id: "assets", label: "Tokenized assets" },
  { id: "litvm", label: "LitVM" },
  { id: "contracts", label: "Contracts" },
  { id: "liquidations", label: "Liquidations" },
  { id: "safety", label: "Risks" },
  { id: "faq", label: "FAQ" },
] as const;

type SectionId = (typeof toc)[number]["id"];

const nav = [
  {
    title: "Get started",
    icon: "play" as const,
    items: [
      { href: "/docs", label: "Introduction", active: true },
      { href: APP_URL, label: "Launch app" },
      { href: "#contracts", label: "Contracts" },
    ],
  },
  {
    title: "Concepts",
    icon: "book" as const,
    items: [
      { href: "#trove", label: "Troves" },
      { href: "#fnusd", label: "FnUSD" },
      { href: "#ratio", label: "Collateral ratio" },
      { href: "#fees", label: "Fees" },
      { href: "#trade", label: "Trading stocks" },
      { href: "#assets", label: "Tokenized assets" },
      { href: "#safety", label: "Risks" },
    ],
  },
];

// Current LiteForge deployment (chain id 4441).
const fenusContracts = [
  { name: "FnUSD", address: "0x219F2AC287458cD58aB46ABd3cfbe451728323f4", note: "FENUS stablecoin, 6 decimals" },
  { name: "wzkLTC", address: "0xa779d43BCaBda81f3324d11392f4ae35Bb2Fbfec", note: "Wrapped zkLitecoin collateral, 8 decimals" },
  { name: "AddressesRegistry", address: "0xAE3A7af98cfE48910cCf5495d3ADcAb37026eeDf", note: "Frozen. Addresses cannot change" },
  { name: "BorrowerOperations", address: "0x70ae94769345031F7fC9C611d8bC822bCFcfB111", note: "Open, adjust and close Troves" },
  { name: "TroveManager", address: "0xD001F1E7CB690C12E191bf7Aa1c3B6332D92a8B4", note: "Trove state and liquidations" },
  { name: "TroveNFT", address: "0x3A856810c38a0446692c8C44400A09Dc9bAA519f", note: "Each Trove is an NFT you can transfer" },
  { name: "PriceFeed", address: "0x39992B70D9C36902aeE699185E94d021BDa94ab6", note: "LTC/USD oracle" },
  { name: "SortedTroves", address: "0x992630fb5e0Cf7E040D5063564B181fa4b2eee0d", note: "Troves ordered by ratio" },
  { name: "CollateralRegistry", address: "0x23D5e06576FCA811F5da9594491972C085B83490", note: "Collateral branches" },
  { name: "ActivePool", address: "0x164f3C4F3f3a047c5005fAFABE9e0b1227BC8a0B", note: "Collateral and debt of open Troves" },
  { name: "DefaultPool", address: "0x8b72d0FfDa721f9E62eC9a0ae5A35273961cD3F0", note: "Liquidated collateral and debt to redistribute" },
  { name: "CollSurplusPool", address: "0xb29fEf2f09229C9f77e9528185AB204d19668Af7", note: "Surplus collateral after liquidation" },
  { name: "GasPool", address: "0xdA00c1C3d32e5B59E7a9b85dfAa47592C77CCA25", note: "Gas compensation reserve" },
  { name: "RedemptionHelper", address: "0x693054a3FEacEd02345D47Fe19EeF5719f473035", note: "Redemption routing" },
  { name: "HintHelpers", address: "0xac4506c363430c90A1dc25d452778f10737aabC0", note: "Insert position hints" },
];

const kinds: { kind: TokenKind; label: string }[] = [
  { kind: "stock", label: "Stocks" },
  { kind: "etf", label: "ETFs" },
  { kind: "commodity", label: "Commodities" },
];

const sortedTokens = [...TOKEN_REGISTRY].sort((a, b) => a.symbol.localeCompare(b.symbol));

function NavIcon({ kind }: { kind: "play" | "book" | "list" }) {
  if (kind === "play") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        <path d="M4 3.5v9l8-4.5z" />
      </svg>
    );
  }
  if (kind === "book") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M3 3.5h5.5A2.5 2.5 0 0 1 11 6v7H5.5A2.5 2.5 0 0 0 3 15.5z" />
        <path d="M13 3.5H7.5A2.5 2.5 0 0 0 5 6v7h5.5A2.5 2.5 0 0 1 13 15.5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3 4.5h10M3 8h10M3 11.5h7" />
    </svg>
  );
}

function Addr({ address }: { address: string }) {
  return (
    <a
      href={`${EXPLORER}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-mono text-[12px] text-[#111] underline decoration-[#d5d0c8] underline-offset-2 hover:decoration-black"
    >
      {address}
    </a>
  );
}

function Mark({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="flex h-6 w-6 min-w-6 items-center justify-center rounded-full bg-[#111] text-[10px] font-medium text-white">
        {label.slice(0, 1)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-6 w-6 min-w-6 max-w-none rounded-full bg-white object-contain" />
  );
}

export function Docs() {
  const [active, setActive] = useState<SectionId>("start");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedTokens;
    return sortedTokens.filter(
      (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    const nodes = toc
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id as SectionId | undefined;
        if (id) setActive(id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0.12, 0.35, 0.65] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  function go(id: SectionId) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyPage() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-[#111]">
      <header className="sticky top-0 z-40 border-b border-[#ebe7e0] bg-[#fdfcf9]/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-[-0.03em]">
            FENUS
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-full border border-[#ddd8cf] px-3 py-1.5 text-[12px] font-medium xl:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
            <Link
              href="/"
              className="hidden items-center gap-1 rounded-full border border-[#111] px-3.5 py-1.5 text-[12px] font-medium sm:inline-flex"
            >
              Website <span className="text-[#999]">›</span>
            </Link>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-black px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#222]"
            >
              Launch App
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] xl:grid-cols-[220px_minmax(0,1fr)_200px]">
        <aside
          className={`border-[#ebe7e0] xl:sticky xl:top-14 xl:h-[calc(100vh-56px)] xl:overflow-y-auto xl:border-r ${
            open ? "block border-b px-4 py-5" : "hidden xl:block"
          }`}
        >
          <nav className="xl:px-5 xl:py-8">
            {nav.map((group) => (
              <div key={group.title} className="mb-7">
                <p className="mb-2 flex items-center gap-2 px-2 text-[12px] font-semibold text-black">
                  <NavIcon kind={group.icon} />
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const activeItem = "active" in item && item.active;
                    return (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          onClick={() => {
                            if (item.href.startsWith("#")) go(item.href.slice(1) as SectionId);
                            setOpen(false);
                          }}
                          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] ${
                            activeItem ? "font-semibold text-black" : "text-[#6d6d6d] hover:bg-[#f3f0ea] hover:text-black"
                          }`}
                        >
                          {activeItem ? <span className="text-[#999]">›</span> : <span className="w-2" />}
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
          <article className="mx-auto max-w-[720px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.14em] text-[#a3a3a3] uppercase">Get started</p>
                <h1 className="mt-3 font-[family-name:var(--font-instrument-serif)] text-[2.6rem] leading-[1.05] font-normal tracking-[-0.02em] sm:text-[3rem]">
                  Introduction
                </h1>
              </div>
              <button
                type="button"
                onClick={() => void copyPage()}
                className="mt-8 flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5e0d8] bg-white px-2.5 py-1.5 text-[12px] text-[#555] hover:bg-[#f7f4ef]"
              >
                {copied ? "Copied" : "Copy page"}
              </button>
            </div>
            <p className="mt-4 text-[17px] leading-7 text-[#3a3a3a]">
              Borrow, invest and trade tokenized stocks, ETFs and commodities on LitVM. Lock wzkLTC, mint FnUSD, and trade real markets 24/7. This page is the full product and protocol guide, including every contract address you can verify on the explorer.
            </p>

            <section id="start" className="docs-prose scroll-mt-24 pt-12">
              <h2>Start here</h2>
              <p>
                FENUS is a decentralized protocol on LitVM. It turns real-world assets into on-chain tokens you can trade, hold and use, and it issues FnUSD, an over-collateralized stablecoin backed by wrapped Litecoin.
              </p>
              <div className="docs-callout">
                <p className="font-medium text-black">The short version</p>
                <p className="mt-2">
                  Lock wzkLTC in a Trove. Mint FnUSD against it at 0% interest. Keep your collateral ratio at 135% or higher. Use FnUSD to buy tokenized stocks, ETFs and commodities whenever you want, including nights and weekends.
                </p>
              </div>
              <p>
                Open the app at{" "}
                <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                  app.fenus.xyz
                </a>{" "}
                and connect any wallet that supports custom EVM networks. Add LitVM, get wzkLTC, and open your first Trove.
              </p>
            </section>

            <section id="fenus" className="docs-prose scroll-mt-24 pt-12">
              <h2>What is FENUS</h2>
              <p>FENUS is built around three pieces:</p>
              <ul>
                <li>Troves: collateralized debt positions where you lock wzkLTC and borrow FnUSD against it.</li>
                <li>FnUSD: the protocol&apos;s over-collateralized USD stablecoin, redeemable and censorship-resistant.</li>
                <li>Tokenized assets: {COUNTS.all} on-chain representations of stocks, ETFs and commodities you can trade natively on LitVM.</li>
              </ul>
            </section>

            <section id="trove" className="docs-prose scroll-mt-24 pt-12">
              <h2>Troves</h2>
              <p>
                A Trove is your position. It holds the wzkLTC you deposit and records the FnUSD you owe. Every Trove is minted as an NFT, so you can transfer the whole position to another wallet in one step.
              </p>
              <ul>
                <li>One Trove per wallet address.</li>
                <li>Add or remove collateral at any time, as long as the ratio stays above the minimum.</li>
                <li>Borrow more or repay at any time.</li>
                <li>Close the Trove by repaying the debt. Your wzkLTC comes back to you.</li>
              </ul>
            </section>

            <section id="fnusd" className="docs-prose scroll-mt-24 pt-12">
              <h2>FnUSD</h2>
              <p>
                FnUSD is the FENUS stablecoin. It is minted only when someone borrows against a Trove, so every FnUSD in circulation is backed by more than a dollar of wzkLTC. It uses 6 decimals, like USDC.
              </p>
              <p>
                FnUSD is what you trade with. Buy a tokenized stock with FnUSD, sell it back to FnUSD, or provide FnUSD liquidity on Addax in the FnUSD / wzkLTC and FnUSD / aUSDC pools.
              </p>
            </section>

            <section id="ratio" className="docs-prose scroll-mt-24 pt-12">
              <h2>Collateral ratio</h2>
              <p>Your collateral ratio is the value of your wzkLTC in USD divided by your FnUSD debt. It is the main safety dial for a Trove.</p>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Ratio</th>
                      <th>Label</th>
                      <th>What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>200% or more</td>
                      <td>Safe</td>
                      <td>Comfortable cushion</td>
                    </tr>
                    <tr>
                      <td>160% to 200%</td>
                      <td>Moderate</td>
                      <td>Watch the market</td>
                    </tr>
                    <tr>
                      <td>135% to 160%</td>
                      <td>Risky</td>
                      <td>You meet the minimum with little room</td>
                    </tr>
                    <tr>
                      <td>Below 135%</td>
                      <td>Below minimum</td>
                      <td>Actions that lower the ratio are blocked. Liquidation risk</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Adding collateral or repaying raises the ratio. Borrowing more, removing collateral, or a falling LTC price lowers it. The app shows a liquidation price so you can see roughly where LTC would have to fall before the position is at risk.
              </p>
            </section>

            <section id="fees" className="docs-prose scroll-mt-24 pt-12">
              <h2>Fees</h2>
              <p>Borrowing on FENUS has no ongoing interest. Network gas on LitVM is separate and paid in wzkLTC.</p>
              <div className="docs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Interest</td>
                      <td>0% APR</td>
                    </tr>
                    <tr>
                      <td>Origination fee, at open and when borrowing more</td>
                      <td>0.5% of borrowed FnUSD</td>
                    </tr>
                    <tr>
                      <td>Minimum collateral ratio</td>
                      <td>135%</td>
                    </tr>
                    <tr>
                      <td>Troves per wallet</td>
                      <td>1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>Your total debt at open is the amount you borrow plus the origination fee.</p>
            </section>

            <section id="borrow" className="docs-prose scroll-mt-24 pt-12">
              <h2>Borrowing FnUSD</h2>
              <ol>
                <li>
                  Open{" "}
                  <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                    app.fenus.xyz
                  </a>{" "}
                  and connect your wallet on LitVM.
                </li>
                <li>Deposit wzkLTC as collateral in a new Trove.</li>
                <li>Choose how much FnUSD to mint. The preview shows your ratio, liquidation price and the 0.5% fee.</li>
                <li>Confirm the transaction. FnUSD lands in your wallet.</li>
                <li>Repay at any time to unlock collateral, or close the Trove entirely.</li>
              </ol>
              <div className="docs-note">
                <p>Keep a comfortable buffer above 135%. A sharp drop in the LTC price can push a thin Trove below the minimum.</p>
              </div>
            </section>

            <section id="trade" className="docs-prose scroll-mt-24 pt-12">
              <h2>Trading stocks</h2>
              <p>
                FENUS lists {COUNTS.stock} stocks, {COUNTS.etf} ETFs and {COUNTS.commodity} commodities as tokens on LitVM. Each token tracks the price of its underlying asset. You buy and sell them with FnUSD, and the market stays open around the clock.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "SPY", "QQQ", "GLD"].map((symbol) => (
                  <span key={symbol} className="inline-flex items-center gap-2 rounded-full border border-[#ebe7e0] bg-white px-3 py-1.5 text-[13px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={stockLogo(symbol)} alt="" className="h-5 w-5 object-contain" />
                    {symbol}
                  </span>
                ))}
              </div>
              <ul>
                <li>Prices come from live market data and update continuously.</li>
                <li>Tokens are standard ERC-20s. Import any of them into your wallet with the address in the registry below.</li>
                <li>Protocol TVL is the minted supply of every token valued at its live price.</li>
              </ul>
            </section>

            <section id="assets" className="docs-prose scroll-mt-24 pt-12">
              <h2>Tokenized assets</h2>
              <p>
                These are the canonical addresses for all {COUNTS.all} assets FENUS tokenizes. Always check the address before importing a token or signing a transaction.
              </p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ticker, company, or address"
                className="mt-4 w-full rounded-lg border border-[#e5e0d8] bg-white px-3 py-2 text-[13px] outline-none placeholder:text-[#a3a3a3] focus:border-[#111]"
              />
              {kinds.map(({ kind, label }) => {
                const rows = filtered.filter((t) => t.kind === kind);
                if (!rows.length) return null;
                return (
                  <div key={kind}>
                    <h3 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-[1.35rem] font-normal text-black">
                      {label} <span className="text-[14px] text-[#a3a3a3]">{rows.length}</span>
                    </h3>
                    <div className="docs-table mt-3 max-h-[520px] overflow-y-auto">
                      <table>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Ticker</th>
                            <th>Name</th>
                            <th>Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.address}>
                              <td>
                                <Mark src={stockLogo(row.symbol)} label={row.symbol} />
                              </td>
                              <td>{row.symbol}</td>
                              <td>{row.name}</td>
                              <td>
                                <Addr address={row.address} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 ? <p>No assets match &ldquo;{query}&rdquo;.</p> : null}
            </section>

            <section id="litvm" className="docs-prose scroll-mt-24 pt-12">
              <h2>LitVM</h2>
              <p>
                FENUS runs on LitVM LiteForge, an EVM-compatible chain secured by Litecoin. Any wallet that supports custom EVM networks can connect.
              </p>
              <ul>
                <li>Chain id: 4441</li>
                <li>RPC: https://liteforge.rpc.caldera.xyz/http</li>
                <li>Explorer: liteforge.explorer.caldera.xyz</li>
                <li>Gas token: wzkLTC</li>
                <li>Stablecoin: FnUSD</li>
              </ul>
            </section>

            <section id="contracts" className="docs-prose scroll-mt-24 pt-12">
              <h2>Contracts</h2>
              <p>
                Verify these on the explorer before you trust a frontend. The AddressesRegistry is frozen, so none of these addresses can be swapped out later.
              </p>

              <h3 className="mt-8 font-[family-name:var(--font-instrument-serif)] text-[1.35rem] font-normal text-black">FENUS protocol</h3>
              <div className="docs-table mt-3">
                <table>
                  <thead>
                    <tr>
                      <th>Contract</th>
                      <th>Address</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fenusContracts.map((row) => (
                      <tr key={row.address}>
                        <td>{row.name}</td>
                        <td>
                          <Addr address={row.address} />
                        </td>
                        <td>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Explorer base:{" "}
                <a
                  href={EXPLORER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-black underline decoration-[#d5d0c8] underline-offset-4 hover:decoration-black"
                >
                  {EXPLORER}
                </a>
              </p>
            </section>

            <section id="liquidations" className="docs-prose scroll-mt-24 pt-12">
              <h2>Liquidations</h2>
              <p>
                A Trove that falls below the 135% minimum can be liquidated. Its collateral and debt move to the Default Pool and are redistributed across the Troves that are still open.
              </p>
              <p>
                That is how Trove holders can earn from liquidations. The Dashboard shows it as Pending Coll. Gain and Pending Debt Absorbed. Earning from other liquidations does not remove your own liquidation risk.
              </p>
            </section>

            <section id="safety" className="docs-prose scroll-mt-24 pt-12">
              <h2>Risks</h2>
              <ul>
                <li>Market risk: the value of your collateral can move sharply against you.</li>
                <li>Liquidation risk: Troves below 135% can be liquidated.</li>
                <li>Oracle risk: ratios and prices depend on the LTC/USD feed and live market data.</li>
                <li>Smart contract risk: DeFi protocols carry code risk, including FENUS.</li>
                <li>Always cross check contract addresses on the explorer against this page before you sign.</li>
              </ul>
            </section>

            <section id="faq" className="docs-prose scroll-mt-24 pt-12 pb-24">
              <h2>FAQ</h2>
              <p>
                <strong>What is FnUSD?</strong> FENUS&apos;s over-collateralized USD stablecoin, minted by locking wzkLTC in a Trove.
              </p>
              <p>
                <strong>Can I trade on weekends?</strong> Yes. Tokenized stocks on FENUS trade 24/7.
              </p>
              <p>
                <strong>How do I import a token?</strong> Copy its address from the registry above and paste it into your wallet&apos;s import token dialog.
              </p>
              <p>
                <strong>Where can I get help?</strong> Reach the FENUS team on X at{" "}
                <a href={X_URL} target="_blank" rel="noopener noreferrer">
                  @fenus_protocol
                </a>
                .
              </p>
              <p className="pt-2">
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-black underline decoration-[#d5d0c8] underline-offset-4 hover:decoration-black"
                >
                  Launch the app
                </a>
                {" · "}
                <Link href="/" className="font-medium text-black underline decoration-[#d5d0c8] underline-offset-4 hover:decoration-black">
                  Back to the website
                </Link>
              </p>
            </section>
          </article>
        </main>

        <aside className="hidden border-l border-[#ebe7e0] xl:block">
          <div className="sticky top-14 px-5 py-8">
            <p className="mb-3 flex items-center gap-2 text-[12px] font-medium text-[#8a8a8a]">
              <NavIcon kind="list" />
              On this page
            </p>
            <ul className="space-y-1">
              {toc.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => go(section.id)}
                    className={`flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[12.5px] ${
                      active === section.id ? "font-semibold text-black" : "text-[#7a7a7a] hover:text-black"
                    }`}
                  >
                    {active === section.id ? <span className="text-[#999]">›</span> : <span className="w-2" />}
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
