const EquityMarket = () => {
  return (
    <section
      id="market"
      className="relative isolate overflow-hidden border-y border-border bg-background py-28 sm:py-40"
    >
      {/* dotted grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <span className="mb-6 rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-foreground/70">
          Why Now
        </span>

        <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">
          Trillions of Equity<br />are coming <span className="text-muted-foreground">on-chain.</span>
        </h2>

        <div className="mt-16 sm:mt-20">
          <p className="font-display text-[80px] leading-none tracking-tighter sm:text-[140px] md:text-[180px]">
            $110T
          </p>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.5em] text-muted-foreground sm:text-xs">
            Global Equity Market
          </p>
        </div>
      </div>
    </section>
  );
};

export default EquityMarket;
