import { useState } from "react";
import {
  Card,
  GhostButton,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

const tabs = ["Open", "Adjust", "Close"] as const;

const Trove = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Open");

  const collateral = 0;
  const debt = 0;
  const price = 0;

  const collRatio =
    debt > 0 && price > 0
      ? `${((collateral * price) / debt * 100).toFixed(1)}%`
      : "N/A";

  const liqPrice =
    collateral > 0
      ? `$${((debt * 1.3) / collateral).toFixed(4)}`
      : "N/A";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit zkLTC, mint FnUSD, manage your debt.
        </p>
      </div>

      <div className="space-y-5">
        <Card className="p-4">
          <div className="flex rounded-full bg-background/60 p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full px-4 py-2 text-xs font-medium transition ${
                  tab === t
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab !== "Close" ? (
            <div className="mt-4 space-y-3">
              <TokenInput label="Deposit" symbol="zkLTC" balance="0.00" />
              <TokenInput label="Mint" symbol="FnUSD" balance="0.00" />
              <div className="flex justify-end pt-1">
                <PrimaryButton>{tab === "Open" ? "Open Trove" : "Update Trove"}</PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
                Repay all outstanding FnUSD debt to close your Trove and withdraw your zkLTC.
              </p>
              <TokenInput label="Repay" symbol="FnUSD" balance="0.00" />
              <div className="flex justify-end pt-1">
                <GhostButton>Close Trove</GhostButton>
              </div>
            </div>
          )}
        </Card>

        <div>
          <SectionLabel>Position Preview</SectionLabel>
          <Card className="p-5">
            <Row label="Collateral Ratio"  value={collRatio} hint="Min 130%" />
            <Row label="Liquidation Price" value={liqPrice}  hint="per zkLTC" />
            <Row label="Interest Rate"     value="1.00% APR" hint="Fixed — accrues to treasury" />
            <Row label="Origination Fee"   value="0.50%"     hint="One-time, added to debt" />
            <Row label="Min Debt"          value="500 FnUSD" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Trove;
