import {
  Card,
  Field,
  GhostButton,
  PageHeader,
  PrimaryButton,
  Row,
  SectionLabel,
  Stat,
} from "@/components/app/Shared";

const Stability = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Stability Pool"
        title="Earn yield by backstopping FnUSD."
        description="Deposit FnUSD to absorb liquidations and earn discounted zkLTC plus protocol fees."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Deposit" suffix="FnUSD" balance="0.00" />
            <Field label="Withdraw" suffix="FnUSD" balance="0.00" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PrimaryButton>Deposit</PrimaryButton>
            <GhostButton>Withdraw</GhostButton>
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Your Position</SectionLabel>
          <div className="mb-6 space-y-5">
            <Stat label="Deposited" value="0.00" hint="FnUSD" accent />
            <Stat label="zkLTC Gains" value="0.0000" />
          </div>
          <Row label="Current APY" value="0.00%" />
          <Row label="Pool Share" value="0.00%" />
          <div className="mt-5">
            <GhostButton>Claim Rewards</GhostButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stability;
