import { NavLink, Outlet } from "react-router-dom";
import { Settings } from "lucide-react";
import logo from "@/assets/fenus-logo.png";

const nav = [
  { to: "/app", end: true, label: "Home" },
  { to: "/app/trove", label: "Trove" },
  { to: "/app/stability", label: "Earn" },
  { to: "/app/redeem", label: "Swap" },
  { to: "/app/pools", label: "Pools" },
];

const tabCls = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 items-center justify-center rounded-full px-4 py-2 text-xs font-medium transition ${
    isActive
      ? "bg-foreground text-background"
      : "text-muted-foreground hover:text-foreground"
  }`;

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(0_0%_12%)_0%,hsl(0_0%_0%)_60%)]"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <NavLink to="/" className="flex items-center gap-2">
            <img src={logo} alt="FENUS" className="h-6 w-6" />
            <span className="font-display text-sm font-semibold tracking-tight">FENUS</span>
          </NavLink>

          <button
            aria-label="Settings"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-5 pb-32 pt-6 sm:px-8 sm:pb-24 sm:pt-10">
        <Outlet />
      </main>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-4 left-1/2 z-40 w-[min(calc(100%-1.5rem),36rem)] -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={tabCls}>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
