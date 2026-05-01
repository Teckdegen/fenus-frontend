import { NavLink, Outlet } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import logo from "@/assets/fenus-logo.png";

const nav = [
  { to: "/app", end: true, label: "Home" },
  { to: "/app/trove", label: "Trove" },
  { to: "/app/redeem", label: "Redeem" },
  { to: "/app/pools", label: "Pools" },
];

const tabCls = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 items-center justify-center rounded-full px-4 py-2 text-xs font-medium transition ${
    isActive
      ? "bg-foreground text-background"
      : "text-muted-foreground hover:text-foreground"
  }`;

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const AppLayout = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(0_0%_12%)_0%,hsl(0_0%_0%)_60%)]"
      />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <NavLink to="/" className="flex items-center gap-2">
            <img src={logo} alt="FENUS" className="h-6 w-6" />
            <span className="font-display text-sm font-semibold tracking-tight">FENUS</span>
          </NavLink>

          {isConnected && address ? (
            <button
              onClick={() => open({ view: "Account" })}
              className="flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold text-background transition hover:opacity-90"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono">{shorten(address)}</span>
            </button>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold text-background transition hover:opacity-90"
            >
              <Wallet className="h-3 w-3" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-32 pt-6 sm:px-8 sm:pb-24 sm:pt-10">
        <Outlet />
      </main>

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
