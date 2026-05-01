import { Link } from "react-router-dom";
import { Card, Row, SectionLabel } from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";

const whiteBtn =
  "inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90";

const Dashboard = () => {
  const {
    hasTrove, isConnected,
    troveColl, troveDebt, troveCollUSD,
    troveRatio, troveLiqPrice,
    defaultPoolColl, defaultPoolDebt,
    wzkLTCBalance, fnUSDBalance, ltcPriceUSD,
  } = useBalances();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your Trove position and pending redistribution gains at a glance.
        </p>
      </div>

      {/* Wallet balances strip */}
      {isConnected && (
        <Card className="p-4 flex items-center justify-around gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">WzkLTC Balance</p>
            <p className="font-display text-lg font-semibold tabular-nums mt-0.5">{wzkLTCBalance}</p>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">FnUSD Balance</p>
            <p className="font-display text-lg font-semibold tabular-nums mt-0.5">{fnUSDBalance}</p>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">LTC Price</p>
            <p className="font-display text-lg font-semibold tabular-nums mt-0.5">${ltcPriceUSD}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Trove */}
        <div>
          <SectionLabel>Your Trove</SectionLabel>
          <Card className="p-5">
            {hasTrove ? (
              <>
                <Row label="Collateral"        value={`${troveColl} zkLTC`}  hint={`≈ $${troveCollUSD}`} />
                <Row label="Debt"              value={`${troveDebt} FnUSD`} />
                <Row label="Collateral Ratio"  value={troveRatio}            hint="Min 130%" />
                <Row label="Liquidation Price" value={`$${troveLiqPrice}`}   hint="per zkLTC" />
                <Row label="Interest Rate"     value="1.00% APR" />
                <div className="mt-4 flex justify-end">
                  <Link to="/app/trove" className={whiteBtn}>Manage Trove</Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="max-w-xs text-sm text-muted-foreground">
                  {isConnected
                    ? "You don't have a Trove yet. Open one to start borrowing FnUSD against your zkLTC."
                    : "Connect your wallet to see your Trove."}
                </p>
                {isConnected && (
                  <Link to="/app/trove" className={`${whiteBtn} mt-5`}>Open Trove</Link>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Redistribution gains */}
        <div>
          <SectionLabel>Pending Redistribution Gains</SectionLabel>
          <Card className="p-5">
            <Row label="Pending Coll. Gain"    value="0.0000 zkLTC"          hint="From liquidated Troves" />
            <Row label="Pending Debt Absorbed" value="0.00 FnUSD" />
            <Row label="Default Pool Coll."    value={`${defaultPoolColl} zkLTC`} />
            <Row label="Default Pool Debt"     value={`${defaultPoolDebt} FnUSD`} />
            <div className="mt-4 flex justify-end">
              <Link to="/app/pools" className={whiteBtn}>View Pools</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
