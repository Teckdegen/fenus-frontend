import { ArrowDown } from "lucide-react";
import { Card, PageHeader, PrimaryButton, Stat } from "@/components/app/Shared";

const Redeem = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Redeem"
        title="Swap FnUSD for zkLTC at face value."
        description="Help maintain the FnUSD peg. Redemptions are settled at $1 minus the current redemption fee."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="rounded-xl border border-border bg-background/60 p-5">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              You pay
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                placeholder="0.0"
                className="flex-1 bg-transparent font-display text-3xl outline-none placeholder:text-muted-foreground/40"
              />
              <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                FnUSD
              </span>
            </div>
          </div>

          <div className="my-3 flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-5">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              You receive
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex-1 font-display text-3xl text-muted-foreground/60">0.0</span>
              <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">
                zkLTC
              </span>
            </div>
          </div>

          <div className="mt-6">
            <PrimaryButton>Redeem</PrimaryButton>
          </div>
        </Card>

        <Card>
          <p className="mb-5 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Rate
          </p>
          <div className="space-y-5">
            <Stat label="zkLTC Price" value="$0.00" />
            <Stat label="Redemption Fee" value="0.50%" />
            <Stat label="You Receive" value="0.00 zkLTC" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Redeem;
