import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/fenus-logo.png";

const nav = [
  { to: "/app", end: true, label: "Dashboard" },
  { to: "/app/trove", label: "Trove" },
  { to: "/app/stability", label: "Stability Pool" },
  { to: "/app/redeem", label: "Redeem" },
  { to: "/app/pools", label: "Liquidity Pools" },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `relative block rounded-lg px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-foreground/[0.06] text-foreground"
      : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
  }`;

const AppLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <NavLink to="/app" className="flex items-center gap-2">
          <img src={logo} alt="FENUS" className="h-6 w-6" />
          <span className="font-display text-sm font-semibold">FENUS</span>
        </NavLink>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-background p-5 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavLink to="/" className="mb-10 hidden items-center gap-2 md:flex">
            <img src={logo} alt="FENUS" className="h-7 w-7" />
            <span className="font-display text-base font-semibold tracking-tight">FENUS</span>
          </NavLink>

          <p className="mb-3 px-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Protocol
          </p>
          <nav className="flex flex-col gap-0.5">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Wallet
              </p>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">0x0000…0000</p>
            <button className="mt-3 w-full rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90">
              Connect Wallet
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-20 bg-background/60 backdrop-blur md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="min-h-screen flex-1 px-5 py-10 sm:px-10 sm:py-14 md:px-14">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
