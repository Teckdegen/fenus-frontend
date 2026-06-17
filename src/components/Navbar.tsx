import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/fenus-logo.png";

const sections = [
  { id: "how", label: "How it works" },
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
    <header className="fixed top-8 left-1/2 z-50 w-[min(92%,580px)] -translate-x-1/2 sm:top-4">
      <nav className="nav-pill flex items-center justify-between rounded-full px-2.5 py-1.5 sm:px-5 sm:py-2">
        <a href="/" className="flex items-center gap-1.5 sm:gap-2">
          <img src={logo} alt="FENUS" className="h-5 w-5 sm:h-7 sm:w-7" />
          <span className="font-display text-xs font-semibold tracking-tight sm:text-base">
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
          <li>
            <Link
              to="/blog"
              className="transition hover:text-foreground"
            >
              Blog
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/app"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90 transition"
          >
            Launch App
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground md:hidden"
          >
            {open ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-pill mt-2 rounded-2xl px-3 py-2 md:hidden">
          <ul className="flex flex-col text-sm text-muted-foreground">
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-lg px-3 py-2 transition ${
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
            <li>
              <Link
                to="/blog"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 transition hover:bg-foreground/5 hover:text-foreground"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/app"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 transition hover:bg-foreground/5 hover:text-foreground font-medium"
              >
                Launch App →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
