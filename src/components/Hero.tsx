import heroCoins from "@/assets/hero-coins-bw.jpg";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background pt-20 sm:pt-28">

      {/* ── Background image ──
          Mobile  : positioned lower so coins don't overlap the nav/top,
                    object-fit contain so ALL coins are visible (same count as desktop)
          Desktop : covers the full section
      */}
      <img
        src={heroCoins}
        alt=""
        aria-hidden
        className="absolute left-0 w-full opacity-70
                   /* mobile */
                   top-[28%] h-auto object-contain object-center
                   /* sm+ (desktop) */
                   sm:inset-0 sm:top-0 sm:h-full sm:object-cover sm:object-center"
      />

      {/* vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,hsl(0_0%_0%/0.65)_65%,hsl(0_0%_0%)_100%)]"
      />
      {/* bottom fade to page */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
      />

      {/* ── Hero text ──
          Mobile  : centered, 30% bigger (base ~2rem → ~2.6rem)
          Desktop : keeps current sizing
      */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center">

        <p className="mb-5 font-display text-[10px] tracking-[0.5em] text-muted-foreground sm:text-xs">
          FENUS · LITVM
        </p>

        <h1
          className="font-display font-semibold leading-[1.08] text-balance text-center
                     /* mobile — 30% bigger than sm base */
                     text-[2.75rem]
                     /* tablet */
                     sm:text-5xl
                     /* desktop */
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
