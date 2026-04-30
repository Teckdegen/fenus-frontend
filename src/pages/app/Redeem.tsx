import {
  Card,
  PageHeader,
  PrimaryButton,
  Row,
  SectionLabel,
} from "@/components/app/Shared";

const Redeem = () => {
  return (
    <div>
      <PageHeader
        eyebrow="Redeem"
        title="Swap FnUSD for zkLTC at face value."
        description="Help maintain the FnUSD peg. Redemptions are settled at $1 minus the current redemption fee."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-8">
          <div className="rounded-xl border border-border bg-background/60 p-5 transition focus-within:border-foreground/40">
            <div className="flex items-center justify-between">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                You pay
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                placeholder="0.00"
                className="flex-1 bg-transparent font-display text-3xl tabular-nums outline-none placeholder:text-muted-foreground/30"
              />
              <span className="rounded-full border border-border px-3 py-1.5 font-display text-xs uppercase tracking-widest text-muted-foreground">
                FnUSD
              </span>
            </div>
          </div>

          <div className="my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Swap
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-5">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              You receive
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex-1 font-display text-3xl tabular-nums text-muted-foreground/50">
                0.00
              </span>
              <span className="rounded-full border border-border px-3 py-1.5 font-display text-xs uppercase tracking-widest text-muted-foreground">
                zkLTC
              </span>
            </div>
          </div>

          <div className="mt-6">
            <PrimaryButton>Redeem</PrimaryButton>
          </div>
        </Card>

        <Card className="p-6">
          <SectionLabel>Rate</SectionLabel>
          <Row label="zkLTC Price" value="$0.00" />
          <Row label="Redemption Fee" value="0.50%" />
          <Row label="Slippage" value="0.10%" />
          <Row label="Min Received" value="0.00 zkLTC" />
        </Card>
      </div>
    </div>
  );
};

export default Redeem;
