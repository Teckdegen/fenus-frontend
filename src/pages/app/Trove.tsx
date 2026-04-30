import { useState } from "react";
import { Card, Field, GhostButton, PageHeader, PrimaryButton, Stat } from "@/components/app/Shared";

const tabs = ["Open", "Adjust", "Close"] as const;

const Trove = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Open");

  return (
    <div>
      <PageHeader
        eyebrow="Trove"
        title="Open and manage your CDP."
        description="Deposit zkLTC as collateral, mint FnUSD, and adjust your position any time."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-6 inline-flex rounded-full border border-border p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
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
            <div className="space-y-4">
              <Field label="Collateral" suffix="zkLTC" />
              <Field label="Mint" suffix="FnUSD" />
              <Field label="Interest Rate" suffix="%" placeholder="5.00" />
              <div className="pt-2">
                <PrimaryButton>{tab === "Open" ? "Open Trove" : "Update Trove"}</PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Repay all outstanding FnUSD debt to close your Trove and withdraw your zkLTC.
              </p>
              <Field label="Repay" suffix="FnUSD" />
              <GhostButton>Close Trove</GhostButton>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-5 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Position Preview
          </p>
          <div className="space-y-5">
            <Stat label="New Coll. Ratio" value="—" />
            <Stat label="New Liq. Price" value="—" />
            <Stat label="Borrow Fee" value="0.50%" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Trove;
