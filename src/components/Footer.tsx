import logo from "@/assets/fenus-logo.png";
import { ArrowUpRight } from "lucide-react";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-background px-4 pb-4 pt-8 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-card px-7 py-10 shadow-[0_1px_2px_hsl(0_0%_9%/0.05)] ring-1 ring-black/[0.06] sm:px-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="FENUS" className="h-6 w-6" />
            <span className="font-display text-base font-bold tracking-tight">FENUS</span>
          </a>

          <div className="flex items-center gap-2.5">
            <a
              href="https://app.fenus.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              <img src={logo} alt="" aria-hidden className="h-3.5 w-3.5 rounded-full grayscale" />
              Launch App
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://x.com/fenus_protocol"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FENUS on X"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-secondary"
            >
              <XIcon />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} FENUS · Built on LitVM</span>
          <span>Tokenized stocks, commodities &amp; ETFs · FnUSD stablecoin</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
