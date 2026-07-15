const PARTNERS = [
  {
    name: "DIA",
    role: "Oracle infrastructure",
    href: "https://www.diadata.org/",
    description:
      "Transparent, first-party oracle data. FENUS reads LTC/USD directly from DIA's Chainlink-compatible adapter deployed on LitVM.",
  },
  {
    name: "LitVM",
    role: "Execution layer",
    href: "https://litvm.com/",
    description:
      "The EVM-equivalent zk-rollup for Litecoin. FENUS is deployed natively on LitVM LiteForge — the home of onchain LTC.",
  },
  {
    name: "Addax",
    role: "AMM & liquidity",
    href: "#",
    description:
      "The native AMM of LitVM. FnUSD and zkLTC route through Addax pools for deep, permissionless liquidity.",
  },
];

const PoweredBy = () => {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-background py-24 sm:py-32">
      {/* soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsl(0_0%_100%/0.04),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-[10px] tracking-[0.5em] text-muted-foreground">
            INFRASTRUCTURE PARTNERS
          </p>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Powered by battle-tested rails.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every price, every block, every swap — routed through the strongest
            infrastructure in the Litecoin ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PARTNERS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-secondary/30 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-foreground/40 hover:bg-secondary/60"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-3xl font-semibold tracking-tight">
                  {p.name}
                </span>
                <span className="font-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  {p.role}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>

              <div className="mt-8 flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors group-hover:text-foreground">
                Visit
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M3 11L11 3M11 3H5M11 3V9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PoweredBy;
