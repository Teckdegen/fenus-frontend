import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Check, Copy, Search } from "lucide-react";

/* ---------- Tokenized asset registry ---------- */

type Token = {
  symbol: string;
  name: string;
  address: string;
  kind: "stock" | "etf" | "commodity";
};

const TOKENS: Token[] = [
  { symbol: "AAPL",  name: "Apple",                              address: "0x9bEb10a55eA6576F34BE6cEa9dAFdFEfa72aB84c", kind: "stock" },
  { symbol: "MSFT",  name: "Microsoft",                          address: "0x857595bE1f8aD7599BAB7379ef4880c21c91DFad", kind: "stock" },
  { symbol: "GOOGL", name: "Alphabet (Google)",                  address: "0x03631d2eEb6DD518731B2802a6d4f3D0De57CD66", kind: "stock" },
  { symbol: "AMZN",  name: "Amazon",                             address: "0xB950B64DD89B56bF2B5FC43a2C6703fB46F3aa4e", kind: "stock" },
  { symbol: "META",  name: "Meta Platforms",                     address: "0xcaaBCc7380936778D0A87E32fD8C8341aA248D87", kind: "stock" },
  { symbol: "NVDA",  name: "NVIDIA",                             address: "0xbd297294820666b391AeDE51248880E31f908170", kind: "stock" },
  { symbol: "TSLA",  name: "Tesla",                              address: "0x60Ef1aE026bE8C44e791B31aA0C3be67bE8B72E6", kind: "stock" },
  { symbol: "AMD",   name: "Advanced Micro Devices",             address: "0x1aE03b0C8560c03C50e0d9d8Cfa6737Ab944836b", kind: "stock" },
  { symbol: "INTC",  name: "Intel",                              address: "0x16FAc5F7A3be300986720409aDb8970eC7F975Ff", kind: "stock" },
  { symbol: "MU",    name: "Micron Technology",                  address: "0x5CcB2Df49f8B4958de9884edA2dee3f35F59ce7B", kind: "stock" },
  { symbol: "ORCL",  name: "Oracle",                             address: "0x3A114302c954ea5AF9819508db5d0Cf06c65d8Af", kind: "stock" },
  { symbol: "CRWV",  name: "CoreWeave",                          address: "0xF2b4af32A41495eA593C65E0D5A00be93a862fA2", kind: "stock" },
  { symbol: "SNDK",  name: "SanDisk",                            address: "0x5cC6A6388b1d129774eDd7412cD213e6C720717a", kind: "stock" },
  { symbol: "PLTR",  name: "Palantir Technologies",              address: "0xee00fd606521950349568Cb69b849Ae592da3642", kind: "stock" },
  { symbol: "COIN",  name: "Coinbase",                           address: "0x8e21dcE732A313a6460A1BAb630FB4a306Aa3915", kind: "stock" },
  { symbol: "CRCL",  name: "Circle",                             address: "0x01E164937012DF0ce57DCcA70dC846ee85D66F97", kind: "stock" },
  { symbol: "BABA",  name: "Alibaba",                            address: "0xb65D951C69a8CC55095749dDb05996D976055F51", kind: "stock" },
  { symbol: "BE",    name: "Bloom Energy",                       address: "0xf8d15aB6aeC236511b8D8e704C56923452cb6f84", kind: "stock" },
  { symbol: "SPCX",  name: "SpaceX",                             address: "0x06Ec44e313F36Bb814B8C10478BCcd6F61D40E02", kind: "stock" },
  { symbol: "USAR",  name: "USA Rare Earth",                     address: "0xE096C716b00113397A78Ed35cDbF1FB4bDfEF91e", kind: "stock" },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",                  address: "0xD4C0A6E902158EE7F68b06962653c68283d88dDf", kind: "etf" },
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",                   address: "0x4DbEA5D8de706665c5997ef4a6C9033c9e1Fda3D", kind: "etf" },
  { symbol: "SGOV",  name: "iShares 0-3 Month Treasury Bond ETF", address: "0x231ce1B7996846Ffd95981c6cB42cbD987D327B0", kind: "etf" },
  { symbol: "SLV",   name: "iShares Silver Trust",               address: "0xd58c4f9800D272A1D4B6628C7275266dc226ea36", kind: "commodity" },
];

const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/* ---------- In-page section index for the top nav ---------- */

const TOC = [
  { id: "introduction",       label: "Introduction" },
  { id: "what-is-fenus",      label: "What is FENUS" },
  { id: "how-it-works",       label: "How it works" },
  { id: "borrowing",          label: "Borrowing FnUSD" },
  { id: "tokenized-assets",   label: "Tokenized Assets" },
  { id: "network",            label: "Network" },
  { id: "risks",              label: "Risks" },
  { id: "faq",                label: "FAQ" },
];

/* ---------- Small building blocks ---------- */

const Section = ({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 border-t border-border pt-14 first:border-t-0 first:pt-0">
    {eyebrow && (
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
        {eyebrow}
      </div>
    )}
    <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    <div className="prose-docs mt-6 space-y-5 text-[15px] leading-[1.75] text-foreground/85">
      {children}
    </div>
  </section>
);

const Callout = ({
  tone = "default",
  title,
  children,
}: {
  tone?: "default" | "warn";
  title: string;
  children: React.ReactNode;
}) => (
  <aside
    className={`my-6 rounded-xl border p-4 sm:p-5 ${
      tone === "warn"
        ? "border-amber-400/25 bg-amber-400/[0.04]"
        : "border-foreground/15 bg-foreground/[0.03]"
    }`}
  >
    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
      {title}
    </div>
    <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
  </aside>
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md border border-border bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-foreground/85">
    {children}
  </code>
);

/* ---------- Page ---------- */

const Docs = () => {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(TOC[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOKENS;
    return TOKENS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q) ||
        t.kind.includes(q),
    );
  }, [query]);

  const copy = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(addr);
      setTimeout(() => setCopied((c) => (c === addr ? null : c)), 1400);
    } catch {}
  };

  // Highlight the section closest to the top of the viewport in the TOC.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    TOC.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const groups: { label: string; kind: Token["kind"] }[] = [
    { label: "Stocks", kind: "stock" },
    { label: "ETFs", kind: "etf" },
    { label: "Commodities", kind: "commodity" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <img src="/favicon.png" alt="" className="h-5 w-5" />
            <span className="font-display text-sm font-semibold tracking-tight">FENUS Docs</span>
          </Link>
          <a
            href="https://app.fenus.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black transition hover:bg-white/90"
          >
            Launch App
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* In-page section nav (replaces the sidebar) */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav
            aria-label="Documentation sections"
            className="hide-scrollbar -mb-px flex gap-1 overflow-x-auto pb-0"
            style={{ scrollbarWidth: "none" }}
          >
            {TOC.map((s) => {
              const active = s.id === activeId;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={active ? "true" : undefined}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <div className="mb-14">
          <span className="inline-block rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
            Documentation · v1
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Everything you need to build with FENUS.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            FENUS lets you borrow, invest, and trade tokenized stocks, ETFs and commodities on
            LitVM — using $wzkLTC as collateral to mint the FnUSD stablecoin. These docs walk you
            through the protocol, the token registry and how to get started safely.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          <Section id="introduction" eyebrow="Start Here" title="Introduction">
            <p>
              FENUS is a decentralized protocol on <strong>LitVM</strong> that turns real-world
              assets — stocks, ETFs and commodities — into on-chain tokens you can trade, hold
              and use as collateral. It also issues <strong>FnUSD</strong>, a fully-collateralized
              stablecoin backed by wrapped Litecoin (wzkLTC).
            </p>
            <p>
              These docs cover the core concepts, the full asset registry with verified contract
              addresses, and best-practice guidance for interacting with the protocol.
            </p>
            <Callout title="New here?">
              Head to <a href="https://app.fenus.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">app.fenus.xyz</a>, connect
              a LitVM-compatible wallet, and open your first Trove with wzkLTC to mint FnUSD.
            </Callout>
          </Section>

          <Section id="what-is-fenus" eyebrow="Concepts" title="What is FENUS">
            <p>
              FENUS is built around three primitives:
            </p>
            <ul className="ml-5 list-disc space-y-2 marker:text-muted-foreground">
              <li>
                <strong>Troves</strong> — collateralized debt positions where you lock wzkLTC
                and borrow FnUSD against it.
              </li>
              <li>
                <strong>FnUSD</strong> — the protocol's over-collateralized USD stablecoin,
                redeemable and censorship-resistant.
              </li>
              <li>
                <strong>Tokenized Equities</strong> — 1:1 on-chain representations of stocks,
                ETFs and commodities you can trade natively on LitVM.
              </li>
            </ul>
          </Section>

          <Section id="how-it-works" eyebrow="Architecture" title="How it works">
            <p>
              At a high level the protocol looks like this:
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-foreground/[0.03] p-4 font-mono text-[12px] leading-relaxed text-foreground/85">
{`  wzkLTC  ──►  Trove  ──►  mints FnUSD  ──►  used across LitVM
                │
                └──►  Tokenized equity markets (AAPL, TSLA, SPY, …)`}
            </pre>
            <p>
              Every position is over-collateralized. Prices are supplied by on-chain oracles and
              Troves that fall below the minimum collateral ratio become eligible for liquidation.
            </p>
          </Section>

          <Section id="borrowing" eyebrow="Guide" title="Borrowing FnUSD">
            <ol className="ml-5 list-decimal space-y-2 marker:text-muted-foreground">
              <li>Open <a href="https://app.fenus.xyz" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">app.fenus.xyz</a> and connect your wallet on LitVM.</li>
              <li>Deposit wzkLTC as collateral in a new Trove.</li>
              <li>Choose an amount of FnUSD to mint — keeping a healthy collateral ratio.</li>
              <li>Repay FnUSD at any time to unlock collateral, or close the Trove entirely.</li>
            </ol>
            <Callout tone="warn" title="Mind your ratio">
              Keep a comfortable buffer above the minimum collateral ratio. Volatile markets can
              push undercollateralized Troves into liquidation.
            </Callout>
          </Section>

          {/* Tokenized asset registry */}
          <Section id="tokenized-assets" eyebrow="Registry" title="Tokenized Assets on LitVM">
            <p>
              These are the canonical contract addresses for every stock, ETF and commodity
              tokenized by FENUS. Always verify the address before importing a token into your
              wallet or signing a transaction.
            </p>

            <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-4 py-2.5 focus-within:border-foreground/40">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ticker, company, or address…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-6 space-y-10">
              {groups.map((g) => {
                const items = filtered.filter((t) => t.kind === g.kind);
                if (!items.length) return null;
                return (
                  <div key={g.kind}>
                    <div className="mb-3 flex items-baseline justify-between">
                      <h3 className="font-display text-lg font-semibold tracking-tight">
                        {g.label}
                      </h3>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        {items.length} {items.length === 1 ? "asset" : "assets"}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-foreground/[0.03] text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Ticker</th>
                            <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Contract</th>
                            <th className="px-4 py-3 text-right font-semibold">Copy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((t) => (
                            <tr
                              key={t.address}
                              className="border-t border-border/70 transition hover:bg-foreground/[0.02]"
                            >
                              <td className="px-4 py-3">
                                <div className="font-display font-semibold tracking-tight">
                                  {t.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {t.name}
                                </div>
                              </td>
                              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                {t.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-foreground/80">
                                <span className="hidden md:inline">{t.address}</span>
                                <span className="md:hidden">{shortAddr(t.address)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => copy(t.address)}
                                  aria-label={`Copy ${t.symbol} address`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground"
                                >
                                  {copied === t.address ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                  No assets match “{query}”.
                </div>
              )}
            </div>
          </Section>

          <Section id="network" eyebrow="Reference" title="Network">
            <p>
              FENUS is deployed on <strong>LitVM</strong>, an EVM-compatible execution environment
              secured by Litecoin. Any wallet that supports custom EVM networks can interact with
              the protocol.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border/70">
                    <td className="px-4 py-3 text-muted-foreground">Network</td>
                    <td className="px-4 py-3 font-medium">LitVM</td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="px-4 py-3 text-muted-foreground">Native gas token</td>
                    <td className="px-4 py-3 font-medium">wzkLTC</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">Stablecoin</td>
                    <td className="px-4 py-3 font-medium">FnUSD</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Tip: after adding LitVM to your wallet, import a token by pasting its address from
              the <a href="#tokenized-assets" className="underline underline-offset-4 hover:text-foreground">registry above</a>.
            </p>
          </Section>

          <Section id="risks" eyebrow="Important" title="Risks">
            <ul className="ml-5 list-disc space-y-2 marker:text-muted-foreground">
              <li><strong>Market risk</strong> — collateral value can move sharply against you.</li>
              <li><strong>Liquidation risk</strong> — Troves below the minimum ratio can be liquidated.</li>
              <li><strong>Smart-contract risk</strong> — DeFi protocols carry inherent code risk.</li>
              <li><strong>Oracle risk</strong> — pricing depends on on-chain oracle feeds.</li>
            </ul>
          </Section>

          <Section id="faq" eyebrow="Support" title="FAQ">
            <div className="divide-y divide-border rounded-xl border border-border">
              {[
                {
                  q: "What is FnUSD?",
                  a: "FnUSD is FENUS's over-collateralized USD stablecoin, minted by locking wzkLTC in a Trove.",
                },
                {
                  q: "Are tokenized stocks 1:1 backed?",
                  a: "Yes — each tokenized equity represents a claim on the underlying asset, tracked and priced on-chain.",
                },
                {
                  q: "How do I import a token into my wallet?",
                  a: "Copy the contract address from the Tokenized Assets registry and paste it into your wallet's ‘Import token’ dialog.",
                },
                {
                  q: "Where can I get help?",
                  a: "Reach the FENUS team on X at @fenus_protocol.",
                },
              ].map((item) => (
                <details key={item.q} className="group px-4 py-4 sm:px-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {item.q}
                    <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </Section>
        </div>

        <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
          Press <Kbd>↑</Kbd> <Kbd>↓</Kbd> to scroll · Network:{" "}
          <span className="text-foreground">LitVM</span> · Always verify addresses on the
          official FENUS site before signing any transaction.
        </footer>
      </main>

      <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
};

export default Docs;
