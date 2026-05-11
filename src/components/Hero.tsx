import heroBg from "@/assets/hero-bg.png";
import litecoinLogo from "@/assets/logos/litecoin.png";
import appleLogo from "@/assets/logos/apple.png";
import teslaLogo from "@/assets/logos/tesla.png";
import nvidiaLogo from "@/assets/logos/nvidia.png";
import amazonLogo from "@/assets/logos/amazon.png";
import metaLogo from "@/assets/logos/meta.png";

const assets = [
  { src: litecoinLogo, name: "Litecoin" },
  { src: appleLogo, name: "Apple" },
  { src: teslaLogo, name: "Tesla" },
  { src: nvidiaLogo, name: "Nvidia" },
  { src: amazonLogo, name: "Amazon" },
  { src: metaLogo, name: "Meta" },
];

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      {/* Coming soon side ribbon */}
      <div className="absolute right-4 top-24 z-10 hidden md:block">
        <div className="rounded-full border border-foreground/15 bg-background/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-md animate-pulse-soft">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
          Equities · Coming Soon
        </div>
        <p className="mt-2 max-w-[180px] text-right text-[11px] leading-snug text-muted-foreground/80">
          Tokenized stocks on LitVM
        </p>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-6 font-display text-sm tracking-[0.4em] text-muted-foreground">
          FENUS
        </p>
        <h1 className="font-display text-balance text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl">
          Borrow Against Your<br />LitVM / Equities.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Mint $FnUSD with $wzkLTC collateral. Tokenized stocks on LitVM coming soon.
        </p>

        {/* Logo row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {assets.map((a, i) => (
            <div
              key={a.name}
              className="group relative h-12 w-12 overflow-hidden rounded-full border border-foreground/10 bg-background/70 shadow-sm backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:scale-110 sm:h-14 sm:w-14 animate-float"
              style={{ animationDelay: `${i * 0.15}s` }}
              title={a.name}
            >
              <img
                src={a.src}
                alt={`${a.name} logo`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground/70">
          LTC · AAPL · TSLA · NVDA · AMZN · META
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/app"
            className="rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Launch App
          </a>
          <a
            href="/docs"
            className="rounded-full border border-foreground/30 bg-transparent px-7 py-3.5 text-sm font-semibold text-foreground transition hover:bg-foreground/10"
          >
            Docs
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <p className="font-display text-xs tracking-[0.35em] text-muted-foreground">
          DEPOSIT · MINT · LEVERAGE
        </p>
      </div>
    </section>
  );
};

export default Hero;
