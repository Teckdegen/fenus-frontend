import { useState } from "react";
import { ArrowDown, Info } from "lucide-react";
import {
  Card,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

// Redemption fee floor matches Constants.sol: REDEMPTION_FEE_FLOOR = 0.5%
// baseRate is dynamic on-chain — shown as "≥ 0.50%" until connected.
const REDEMPTION_FEE_FLOOR = 0.005; // 0.5%

// Mock oracle price — replace with live feed once connected.
const MOCK_ZKLITECOIN_PRICE = 0; // $0 until connected

const Redeem = () => {
  const [fnUSDAmount, setFnUSDAmount] = useState("");

  const parsed = parseFloat(fnUSDAmount) || 0;
  const price = MOCK_ZKLITECOIN_PRICE;

  // collateralGross = fnUSD / price
  const collateralGross = price > 0 ? parsed / price : 0;
  // fee deducted from collateral out
  const fee = collateralGross * REDEMPTION_FEE_FLOOR;
  const collateralOut = collateralGross - fee;
  const feeUSD = parsed * REDEMPTION_FEE_FLOOR;

  const hasAmount = parsed > 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Redeem</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Burn FnUSD and receive zkLTC at the current oracle price, minus a small redemption fee.
        </p>
      </div>

      {/* Swap card */}
      <Card className="p-5 space-y-3">
        {/* FnUSD input */}
        <TokenInput
          label="You burn"
          symbol="FnUSD"
          balance="0.00"
          value={fnUSDAmount}
          onChange={(v) => setFnUSDAmount(v)}
        />

        {/* Arrow divider */}
        <div className="flex justify-center py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </div>

        {/* zkLTC output — read-only */}
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">You receive</span>
            <span className="font-mono text-[11px] text-muted-foreground">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-full font-display text-3xl font-semibold tabular-nums text-foreground/80">
              {hasAmount && price > 0
                ? collateralOut.toLocaleString(undefined, { maximumFractionDigits: 6 })
                : "—"}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
              <span className="h-5 w-5 rounded-full bg-gradient-to-br from-foreground/80 to-foreground/30" />
              <span className="font-display text-xs font-medium tracking-wide">zkLTC</span>
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        {hasAmount && (
          <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Info className="h-3 w-3" />
                Redemption fee (≥ 0.50%)
              </span>
              <span className="tabular-nums text-muted-foreground">
                {price > 0
                  ? `${fee.toLocaleString(undefined, { maximumFractionDigits: 6 })} zkLTC ≈ $${feeUSD.toFixed(2)}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Oracle price</span>
              <span className="tabular-nums text-muted-foreground">
                {price > 0 ? `$${price.toLocaleString()}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Fee goes to</span>
              <span className="tabular-nums text-muted-foreground">Protocol treasury</span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <PrimaryButton disabled={!hasAmount}>
            Redeem FnUSD
          </PrimaryButton>
        </div>
      </Card>

      {/* Info */}
      <div>
        <SectionLabel>How Redemption Works</SectionLabel>
        <Card className="p-5 space-y-0">
          <Row
            label="Rate"
            value="1 FnUSD = $1 of zkLTC"
            hint="At current oracle price"
          />
          <Row
            label="Fee"
            value="≥ 0.50%"
            hint="Dynamic — rises with redemption volume, decays over time"
          />
          <Row
            label="Fee destination"
            value="Treasury"
            hint="Protocol revenue"
          />
          <Row
            label="Direction"
            value="FnUSD → zkLTC only"
            hint="One-way — burns FnUSD, releases collateral"
          />
          <Row
            label="Minimum"
            value="100 FnUSD"
          />
        </Card>
      </div>
    </div>
  );
};

export default Redeem;
