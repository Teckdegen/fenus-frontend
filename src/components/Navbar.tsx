import { useEffect, useState } from "react";
import logo from "@/assets/fenus-logo.png";

const sections = [
  { id: "stats", label: "Stats" },
  { id: "how", label: "How it works" },
];

const Navbar = () => {
  const [active, setActive] = useState<string>("");

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
    <header className="fixed top-3 left-1/2 z-50 w-[min(92%,520px)] -translate-x-1/2 sm:top-4">
      <nav className="nav-pill flex items-center justify-between rounded-full px-2.5 py-1.5 sm:px-5 sm:py-2">
        <a href="#" className="flex items-center gap-1.5 sm:gap-2">
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
                  className={`relative transition ${
                    isActive ? "text-foreground" : "hover:text-foreground"
                  }`}
                >
                  {s.label}
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-foreground transition-all duration-300 ${
                      isActive ? "w-4 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href="#"
          className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground transition hover:opacity-90 sm:px-3 sm:py-1.5 sm:text-xs"
        >
          Launch App
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
