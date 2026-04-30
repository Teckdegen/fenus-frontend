import { Card, Field, GhostButton, PageHeader, PrimaryButton, Stat } from "@/components/app/Shared";

const Stability = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Stability Pool"
        title="Earn yield by backstopping FnUSD."
        description="Deposit FnUSD to absorb liquidations and earn discounted zkLTC plus protocol fees."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Deposit" suffix="FnUSD" />
            <Field label="Withdraw" suffix="FnUSD" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PrimaryButton>Deposit</PrimaryButton>
            <GhostButton>Withdraw</GhostButton>
          </div>
        </Card>

        <Card>
          <p className="mb-5 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Your Position
          </p>
          <div className="space-y-5">
            <Stat label="Deposited" value="0 FnUSD" />
            <Stat label="zkLTC Gains" value="0.00" />
            <Stat label="Current APY" value="0%" />
          </div>
          <div className="mt-6">
            <GhostButton>Claim Rewards</GhostButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stability;
