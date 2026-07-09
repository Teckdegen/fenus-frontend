import heroCoins from "@/assets/hero-coins-bw.jpg";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background pt-20 sm:pt-28">

      {/* ── Background image ──
          Mobile  : 3x scale so coins fill the entire viewport, no black gaps
                    centered vertically around the midpoint of the image
          Desktop : unchanged — covers the full section naturally
      */}
      <img
        src={heroCoins}
        alt=""
        aria-hidden
        className="
          absolute left-1/2 -translate-x-1/2
          /* mobile: scale 3x, position to fill screen */
          top-1/2 -translate-y-1/2
          w-[300%] h-auto object-cover
          /* sm+ desktop: reset to full cover */
          sm:w-full sm:h-full sm:inset-0 sm:top-0 sm:left-0 sm:translate-x-0 sm:translate-y-0 sm:object-cover sm:object-center
          opacity-70
        "
      />

      {/* vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,hsl(0_0%_0%/0.55)_65%,hsl(0_0%_0%)_100%)]"
      />
      {/* bottom fade */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
      />

      {/* ── Hero text ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center">

        <p className="mb-5 font-display text-[10px] tracking-[0.5em] text-muted-foreground sm:text-xs">
          FENUS · LITVM
        </p>

        <h1
          className="font-display font-semibold leading-[1.08] text-balance text-center
                     text-[2.75rem]
                     sm:text-5xl
                     md:text-6xl"
        >
          Borrow, Invest &amp; Trade
          <br />
          <span className="text-muted-foreground">
            tokenized stocks, commodities &amp; ETFs
          </span>
          <br />
          on LitVM.
        </h1>
      </div>
    </section>
  );
};

export default Hero;
