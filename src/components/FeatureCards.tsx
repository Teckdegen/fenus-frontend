/* Three product cards in the light, editorial style:
   headline, body, and a monochrome graphic with a black pill label. */

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-semibold tracking-widest text-background">
    {children}
  </span>
);

/* Card 1 graphic — dot grid with a circle marker */
const GridGraphic = () => (
  <div className="relative h-56 overflow-hidden">
    <div className="dot-grid absolute inset-x-[-10%] bottom-[-30%] top-[10%] rounded-tl-[60px] [mask-image:radial-gradient(ellipse_at_bottom_left,black,transparent_75%)]" />
    <div className="absolute bottom-[22%] left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border border-foreground/25 bg-background">
      <div className="dot-grid h-full w-full rounded-full opacity-60" />
    </div>
    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2">
      <Pill>wzkLTC</Pill>
    </div>
  </div>
);

/* Card 2 graphic — stacked input rows */
const StackGraphic = () => (
  <div className="relative flex h-56 flex-col justify-center gap-2.5 px-2">
    {["ORACLE", "COLLATERAL", "RATIO"].map((label, i) => (
      <div
        key={label}
        className="flex h-11 items-center rounded-xl border border-border bg-background/80 px-4 text-[11px] font-semibold tracking-[0.25em] text-muted-foreground shadow-sm"
        style={{ marginLeft: `${i * 18}px` }}
      >
        {label}
      </div>
    ))}
    <div className="mt-2 flex items-center justify-end gap-2 pr-2 text-[11px] font-semibold tracking-widest text-muted-foreground">
      FnUSD
      <span className="h-2 w-2 rounded-full bg-foreground" />
    </div>
  </div>
);

/* Card 3 graphic — orbit of app actions around FENUS */
const OrbitGraphic = () => (
  <div className="relative flex h-56 items-center justify-center">
    <div className="absolute h-44 w-44 rounded-full border border-foreground/20 sm:h-48 sm:w-48" />
    <span className="rounded-xl bg-foreground px-4 py-2 text-[11px] font-bold tracking-widest text-background">
      FENUS
    </span>
    {[
      { label: "B", cls: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
      { label: "T", cls: "right-[14%] top-1/2 -translate-y-1/2" },
      { label: "I", cls: "left-[14%] top-1/2 -translate-y-1/2" },
      { label: "24", cls: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" },
    ].map((n) => (
      <span
        key={n.label}
        className={`absolute ${n.cls} flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-foreground`}
      >
        {n.label}
      </span>
    ))}
  </div>
);

const cards = [
  {
    title: "The vault holds it",
    body: "Tokenized stocks, ETFs and commodities sit in your FENUS vault. Post them as collateral and mint FnUSD — your assets never leave your hands.",
    graphic: <GridGraphic />,
  },
  {
    title: "One live price",
    body: "Oracles stream the real market price on-chain. Every trove is priced against the same feed the market uses, at every block.",
    graphic: <StackGraphic />,
  },
  {
    title: "Markets never close",
    body: "Borrow, lend, swap or trade directly on LitVM. No banking hours, no custodian holding your shares — you keep the keys.",
    graphic: <OrbitGraphic />,
  },
];

const FeatureCards = () => {
  return (
    <section id="how" className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="group rounded-3xl bg-card p-7 shadow-[0_1px_2px_hsl(0_0%_9%/0.05)] ring-1 ring-black/[0.06] transition-shadow hover:shadow-[0_24px_60px_-32px_hsl(0_0%_9%/0.25)] sm:p-8"
          >
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {c.title}
              <span className="ml-1 text-muted-foreground/60 transition group-hover:text-foreground">›</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {c.body}
            </p>
            {c.graphic}
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
