import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Card, Row, SectionLabel } from "@/components/app/Shared";

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const address = "0xA13b…f9C2";
  const hasTrove = false;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      {/* Balance + wallet */}
      <Card className="overflow-hidden p-8 text-center lg:col-span-2">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Balance
        </p>
        <p className="mt-3 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text font-display text-6xl font-semibold tracking-tight text-transparent sm:text-7xl">
          $0.00
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">+0.00% · 24h</p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setConnected((v) => !v)}
            className="group flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs transition hover:border-foreground/40"
          >
            {connected ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-foreground/90">{address}</span>
              </>
            ) : (
              <>
                <Wallet className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
                <span className="font-medium">Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Trove */}
      <div>
        <SectionLabel>Your Trove</SectionLabel>
        <Card className="p-6">
          {hasTrove ? (
            <>
              <Row label="Collateral" value="0.0000 zkLTC" hint="≈ $0.00" />
              <Row label="Debt" value="0.00 FnUSD" />
              <Row label="Collateral Ratio" value="—" hint="Min 110%" />
              <Row label="Liquidation Price" value="—" hint="per zkLTC" />
              <Row label="Interest Rate" value="0.00% APR" />
              <div className="mt-5">
                <Link
                  to="/app/trove"
                  className="block w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Manage Trove
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                You don't have a Trove yet. Open one to start borrowing FnUSD against your zkLTC.
              </p>
              <Link
                to="/app/trove"
                className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Open Trove
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Stability Pool Deposit */}
      <div>
        <SectionLabel>Your Stability Pool Deposit</SectionLabel>
        <Card className="p-6">
          <Row label="Deposited" value="0.00 FnUSD" />
          <Row label="Earned" value="0.0000 zkLTC" />
          <div className="mt-5">
            <Link
              to="/app/stability"
              className="block w-full rounded-full border border-border bg-card/60 px-5 py-3 text-center text-sm font-medium transition hover:border-foreground/40"
            >
              Manage Deposit
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
