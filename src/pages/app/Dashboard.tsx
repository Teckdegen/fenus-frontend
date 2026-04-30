import { Card, PageHeader, Stat } from "@/components/app/Shared";

const Dashboard = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Your position at a glance."
        description="Personal Trove metrics alongside live FENUS protocol stats."
      />

      <div className="mb-10">
        <p className="mb-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Your Trove
        </p>
        <Card>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat label="Collateral" value="0.00 zkLTC" />
            <Stat label="Debt" value="0 FnUSD" />
            <Stat label="Coll. Ratio" value="—" hint="Min 110%" />
            <Stat label="Liq. Price" value="—" hint="zkLTC / USD" />
          </div>
        </Card>
      </div>

      <div>
        <p className="mb-4 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Protocol
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><Stat label="TVL" value="$0" /></Card>
          <Card><Stat label="FnUSD Minted" value="$0" /></Card>
          <Card><Stat label="Stability APY" value="0%" /></Card>
          <Card><Stat label="Redemption Fee" value="0.50%" /></Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
