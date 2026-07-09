import heroCoins from "@/assets/hero-coins-bw.jpg";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background pt-28">
      <img
        src={heroCoins}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      {/* vignette + fade to page */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,hsl(0_0%_0%/0.7)_70%,hsl(0_0%_0%)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <p className="mb-6 font-display text-[10px] tracking-[0.5em] text-muted-foreground sm:text-xs">
          FENUS · LITVM
        </p>
        <h1 className="font-display text-balance text-3xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
          Borrow, Invest & Trade<br />
          <span className="text-muted-foreground">tokenized stocks, commodities & ETFs</span><br />
          on LitVM.
        </h1>
      </div>
    </section>
  );
};

export default Hero;
