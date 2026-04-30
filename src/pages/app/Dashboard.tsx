import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Card, Row, SectionLabel } from "@/components/app/Shared";

const whiteBtn =
  "rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90";

const Dashboard = () => {
  const [connected, setConnected] = useState(false);
  const address = "0xA13b…f9C2";
  const hasTrove = false;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
      {/* Wallet connect */}
      <div className="flex justify-center lg:col-span-2">
        <button
          onClick={() => setConnected((v) => !v)}
          className="group flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition hover:opacity-90"
        >
          {connected ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono">{address}</span>
            </>
          ) : (
            <>
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </div>

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
                <Link to="/app/trove" className={`${whiteBtn} block w-full text-center`}>
                  Manage Trove
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                You don't have a Trove yet. Open one to start borrowing FnUSD against your zkLTC.
              </p>
              <Link to="/app/trove" className={`${whiteBtn} mt-5`}>
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
            <Link to="/app/stability" className={`${whiteBtn} block w-full text-center`}>
              Manage Deposit
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
