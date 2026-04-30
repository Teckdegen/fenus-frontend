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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit zkLTC, mint FnUSD, manage your debt.
        </p>
      </div>

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
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Interest rate</span>
                <span className="font-display text-sm tabular-nums">5.00%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="50"
                defaultValue="5"
                step="0.1"
                className="mt-3 w-full accent-foreground"
              />
            </div>
            <PrimaryButton>{tab === "Open" ? "Open Trove" : "Update Trove"}</PrimaryButton>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
              Repay all outstanding FnUSD debt to close your Trove and withdraw your zkLTC.
            </p>
            <TokenInput label="Repay" symbol="FnUSD" balance="0.00" />
            <GhostButton>Close Trove</GhostButton>
          </div>
        )}
      </Card>

      <div>
        <SectionLabel>Position Preview</SectionLabel>
        <Card className="p-5">
          <Row label="New Coll. Ratio" value="—" />
          <Row label="New Liq. Price" value="—" />
          <Row label="Borrow Fee" value="0.50%" />
          <Row label="Min Debt" value="200 FnUSD" />
        </Card>
      </div>
    </div>
  );
};

export default Trove;
