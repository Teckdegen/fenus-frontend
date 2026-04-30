import { Card, PageHeader, SectionLabel, Stat } from "@/components/app/Shared";

const Dashboard = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Your position at a glance."
        description="Personal Trove metrics alongside live FENUS protocol stats."
        right={
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              LiteVM Mainnet
            </span>
          </div>
        }
      />

      <div className="mb-12">
        <SectionLabel>Your Trove</SectionLabel>
        <Card className="p-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat label="Collateral" value="0.00" hint="zkLTC" accent />
            <Stat label="Debt" value="0.00" hint="FnUSD" accent />
            <Stat label="Coll. Ratio" value="—" hint="Min 110%" />
            <Stat label="Liq. Price" value="—" hint="zkLTC / USD" />
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel>Protocol</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6"><Stat label="TVL" value="$0" /></Card>
          <Card className="p-6"><Stat label="FnUSD Minted" value="$0" /></Card>
          <Card className="p-6"><Stat label="Stability APY" value="0%" /></Card>
          <Card className="p-6"><Stat label="Redemption Fee" value="0.50%" /></Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
