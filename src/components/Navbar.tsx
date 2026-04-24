import logo from "@/assets/fenus-logo.png";

const Navbar = () => {
  return (
    <header className="fixed top-4 left-1/2 z-50 w-[min(96%,1180px)] -translate-x-1/2">
      <nav className="nav-pill flex items-center justify-between rounded-full px-4 py-2 sm:px-5">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="FENUS" className="h-7 w-7" />
          <span className="font-display text-base font-semibold tracking-tight">FENUS</span>
        </a>

        <ul className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <li><a href="#stats" className="transition hover:text-foreground">Stats</a></li>
          <li><a href="#how" className="transition hover:text-foreground">How it works</a></li>
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            Docs
          </a>
          <a
            href="#"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            Launch App
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
