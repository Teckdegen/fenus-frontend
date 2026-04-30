import { useState } from "react";
import {
  Card,
  GhostButton,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

const tabs = ["Deposit", "Withdraw"] as const;

const Stability = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Deposit");

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Earn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit FnUSD to backstop the protocol and earn yield.
        </p>
      </div>

      {/* APY hero */}
      <Card className="p-6 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Current APY
        </p>
        <p className="mt-3 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text font-display text-5xl font-semibold tracking-tight text-transparent">
          0.00%
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Variable · paid in zkLTC + fees</p>
      </Card>

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

        <div className="mt-4 space-y-3">
          <TokenInput label={tab} symbol="FnUSD" balance="0.00" />
          {tab === "Deposit" ? (
            <PrimaryButton>Deposit</PrimaryButton>
          ) : (
            <GhostButton>Withdraw</GhostButton>
          )}
        </div>
      </Card>

      <div>
        <SectionLabel>Your Position</SectionLabel>
        <Card className="p-5">
          <Row label="Deposited" value="0.00 FnUSD" />
          <Row label="zkLTC Gains" value="0.0000" />
          <Row label="Pool Share" value="0.00%" />
          <div className="mt-4">
            <GhostButton>Claim Rewards</GhostButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stability;
