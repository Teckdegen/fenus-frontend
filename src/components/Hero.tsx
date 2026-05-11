import heroBg from "@/assets/hero-bg.png";
import litecoinLogo from "@/assets/logos/litecoin.png";
import appleLogo from "@/assets/logos/apple.png";
import teslaLogo from "@/assets/logos/tesla.png";
import nvidiaLogo from "@/assets/logos/nvidia.png";
import amazonLogo from "@/assets/logos/amazon.png";
import metaLogo from "@/assets/logos/meta.png";

const liveAssets = [{ src: litecoinLogo, name: "wzkLTC", live: true }];
const comingAssets = [
  { src: appleLogo, name: "AAPL" },
  { src: teslaLogo, name: "TSLA" },
  { src: nvidiaLogo, name: "NVDA" },
  { src: amazonLogo, name: "AMZN" },
  { src: metaLogo, name: "META" },
];

const Hero = () => {
  // duplicate for seamless marquee loop
  const marquee = [...comingAssets, ...comingAssets, ...comingAssets];

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden pt-28 sm:pt-32">
      <img
        src={heroBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <p className="mb-6 font-display text-sm tracking-[0.4em] text-muted-foreground">
          FENUS
        </p>
        <h1 className="font-display text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
          Borrow Against Your<br />LitVM / Equity Holdings.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
          Mint <span className="text-foreground">$FnUSD</span> with{" "}
          <span className="text-foreground">$wzkLTC</span> collateral.
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

        {/* Coming soon block */}
        <div className="mt-14">
          <div className="mb-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            <span className="h-px w-8 bg-foreground/20" />
            <span className="rounded-full border border-foreground/15 bg-background/60 px-3 py-1 backdrop-blur-md">
              Coming Soon · Tokenized Equities on LitVM
            </span>
            <span className="h-px w-8 bg-foreground/20" />
          </div>

          {/* Marquee */}
          <div className="group relative mx-auto max-w-3xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused]">
              {marquee.map((a, i) => (
                <div
                  key={`${a.name}-${i}`}
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:scale-110 sm:h-16 sm:w-16"
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
          </div>

          <p className="mt-4 text-xs text-muted-foreground/80 sm:text-sm">
            AAPL · TSLA · NVDA · AMZN · META  and more stocks, equities on the way.
          </p>
        </div>
      </div>

    </section>
  );
};

export default Hero;
