import { Link } from "react-router-dom";
import { Card, Row, SectionLabel } from "@/components/app/Shared";

const whiteBtn =
  "inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90";

const Dashboard = () => {
  const hasTrove = false;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your Trove and Stability Pool position at a glance.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Trove */}
        <div>
          <SectionLabel>Your Trove</SectionLabel>
          <Card className="p-5">
            {hasTrove ? (
              <>
                <Row label="Collateral" value="0.0000 zkLTC" hint="≈ $0.00" />
                <Row label="Debt" value="0.00 FnUSD" />
                <Row label="Collateral Ratio" value="—" hint="Min 110%" />
                <Row label="Liquidation Price" value="—" hint="per zkLTC" />
                <Row label="Interest Rate" value="0.00% APR" />
                <div className="mt-4 flex justify-end">
                  <Link to="/app/trove" className={whiteBtn}>
                    Manage Trove
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
          <Card className="p-5">
            <Row label="Deposited" value="0.00 FnUSD" />
            <Row label="Earned" value="0.0000 zkLTC" />
            <Row label="Pool Share" value="0.00%" />
            <div className="mt-4 flex justify-end">
              <Link to="/app/stability" className={whiteBtn}>
                Manage Deposit
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
