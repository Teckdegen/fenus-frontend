import logo from "@/assets/fenus-logo.png";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={logo} alt="FENUS" className="h-6 w-6" />
          <span className="font-display text-sm font-semibold tracking-tight">FENUS</span>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FENUS. All rights reserved.
        </p>

        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="FENUS on X"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <XIcon />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
