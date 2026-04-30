import logo from "@/assets/fenus-logo.png";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_15%)_0%,hsl(0_0%_0%)_70%)] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(hsl(0_0%_100%/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%/0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <img src={logo} alt="FENUS" className="mx-auto h-10 w-10" />
        <p className="mt-8 font-display text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">
          App
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
          Coming Soon.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
          The FENUS dApp is in final testing. Mint FnUSD, manage Troves, and earn from the
          Stability Pool — landing here shortly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Back home
          </Link>
          <a
            href="https://x.com/fenusprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
          >
            Follow updates
          </a>
        </div>
      </div>
    </main>
  );
};

export default ComingSoon;
