import borrowImg from "@/assets/revamp-borrow.jpg";
import tradeImg from "@/assets/revamp-trade.jpg";
import vaultImg from "@/assets/revamp-vault.jpg";

/* Three photo cards — monochrome imagery, title, body, small-caps tag. */

const cards = [
  {
    img: borrowImg,
    icon: "+",
    title: "Borrow against your holdings",
    body: "Post tokenized stocks, ETFs or commodities as collateral and mint FnUSD instantly. No credit checks, no selling your position.",
    tag: "BORROW",
  },
  {
    img: tradeImg,
    icon: "↑",
    title: "Trade around the clock",
    body: "Markets never close on LitVM. Swap tokenized equities any hour, any day — settlement in seconds, straight from your wallet.",
    tag: "TRADE",
  },
  {
    img: vaultImg,
    icon: "◎",
    title: "Earn on real assets",
    body: "Provide liquidity or lend FnUSD and earn yield backed by tokenized real-world assets, not paper promises.",
    tag: "INVEST",
  },
];

const UseCaseImages = () => {
  return (
    <section id="use" className="relative bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-[11px] font-semibold tracking-[0.35em] text-muted-foreground">
          USE CASES
        </p>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          What you can do
          <br />
          on FENUS
        </h2>

        <div className="mt-12 grid gap-8 sm:gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article key={c.tag} className="group">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src={c.img}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-sm font-semibold text-foreground shadow-sm">
                  {c.icon}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {c.body}
              </p>
              <p className="mt-3 text-[11px] font-semibold tracking-[0.3em] text-muted-foreground/70">
                {c.tag}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCaseImages;
