import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight, BookOpen } from "lucide-react";

const sections = [
  { id: "how", label: "How it works" },
  { id: "stats", label: "By the numbers" },
  { id: "use", label: "Use cases" },
];

const Navbar = () => {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[min(92%,640px)] -translate-x-1/2 sm:top-6">
      <nav className="nav-pill flex items-center justify-between rounded-full px-3 py-2 sm:px-4 sm:py-2">
        <a href="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="FENUS" className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="font-display text-sm font-bold tracking-tight sm:text-base">
            FENUS
          </span>
        </a>

        <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex lg:gap-8">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`transition ${
                    isActive ? "text-foreground" : "hover:text-foreground"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop buttons */}
          <a
            href="https://app.fenus.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90"
          >
            Launch App
            <ArrowUpRight className="h-3 w-3" />
          </a>
          <a
            href="/docs"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
          >
            <BookOpen className="h-3 w-3" />
            Docs
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-pill mt-2 rounded-3xl px-3 py-2 md:hidden">
          <ul className="flex flex-col text-sm text-muted-foreground">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-xl px-3 py-2.5 transition ${
                      isActive
                        ? "bg-foreground/5 text-foreground"
                        : "hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile buttons */}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
            <a
              href="https://app.fenus.xyz"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2.5 text-xs font-semibold text-background"
            >
              Launch App
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="/docs"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground"
            >
              <BookOpen className="h-3 w-3" />
              Docs
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
