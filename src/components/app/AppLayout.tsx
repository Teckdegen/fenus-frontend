import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Coins, Droplets, Repeat, Waves, Menu, X } from "lucide-react";
import logo from "@/assets/fenus-logo.png";

const nav = [
  { to: "/app", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/trove", label: "Trove", icon: Coins },
  { to: "/app/stability", label: "Stability Pool", icon: Droplets },
  { to: "/app/redeem", label: "Redeem", icon: Repeat },
  { to: "/app/pools", label: "Liquidity Pools", icon: Waves },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
    isActive
      ? "bg-foreground/10 text-foreground"
      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
  }`;

const AppLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <NavLink to="/app" className="flex items-center gap-2">
          <img src={logo} alt="FENUS" className="h-6 w-6" />
          <span className="font-display text-sm font-semibold">FENUS</span>
        </NavLink>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-background p-5 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <NavLink to="/" className="mb-8 hidden items-center gap-2 md:flex">
            <img src={logo} alt="FENUS" className="h-7 w-7" />
            <span className="font-display text-base font-semibold tracking-tight">FENUS</span>
          </NavLink>

          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={linkCls}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-border p-4">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Wallet
            </p>
            <p className="mt-2 truncate font-display text-sm">Not connected</p>
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

        {/* Content */}
        <main className="min-h-screen flex-1 px-5 py-8 sm:px-8 sm:py-12 md:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
