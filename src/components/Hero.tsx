import heroCoins from "@/assets/hero-coins-bw.jpg";
import { ArrowUpRight, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background pt-20 sm:pt-28">

      {/*
        ── Background image ──

        MOBILE:
          - Position absolute, centered horizontally + vertically
          - min-h: 100vh so it always covers full screen height
          - w-auto + scale-[2.2] so the coins appear large and fill the frame
          - object-cover + object-center keeps coins centered

        DESKTOP (sm+):
          - Resets to a normal inset-0 full-cover image, no scaling
      */}
      <img
        src={heroCoins}
        alt=""
        aria-hidden
        style={{ objectPosition: "center 50%" }}
        className="
          absolute inset-0
          w-full h-full object-cover opacity-75

          /* mobile — scale just enough to fill height, ~3 coins visible */
          scale-[1.35] origin-center

          /* desktop — no scale, natural cover */
          sm:scale-100
        "
      />

      {/* vignette — keeps edges dark */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_0%/0.35)_0%,hsl(0_0%_0%/0.55)_60%,hsl(0_0%_0%)_100%)]"
      />
      {/* bottom fade to page */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background"
      />

      {/* ── Hero text ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 flex flex-col items-center justify-center text-center">

        <p className="mb-5 font-display text-[10px] tracking-[0.5em] text-muted-foreground sm:text-xs">
          FENUS · LITVM
        </p>

        <h1
          className="
            font-display font-semibold leading-[1.08] text-balance text-center
            text-[2.75rem]
            sm:text-5xl
            md:text-6xl
            [text-shadow:0_2px_20px_rgba(0,0,0,0.9),0_1px_4px_rgba(0,0,0,1)]
          "
        >
          Borrow, Invest &amp; Trade
          <br />
          <span className="text-white/80">
            tokenized stocks, commodities &amp; ETFs
          </span>
          <br />
          on LitVM.
        </h1>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <a
            href="/app"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Launch App
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/40"
          >
            <BookOpen className="h-4 w-4" />
            Docs
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
