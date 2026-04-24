import heroBg from "@/assets/hero-bg.png";

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

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mb-6 font-display text-sm tracking-[0.4em] text-muted-foreground">
          FENUS
        </p>
        <h1 className="font-display text-balance text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl">
          Borrow Against Your<br />LiteVM Holdings.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Mint FnUSD with zkLTC collateral.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <a
            href="#"
            className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Launch App
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
