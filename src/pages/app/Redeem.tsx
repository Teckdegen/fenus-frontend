import { useState } from "react";
import { ArrowDown, Info } from "lucide-react";
import {
  Card,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
  TokenIcon,
} from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";

const REDEMPTION_FEE_FLOOR = 0.005; // 0.5%

const Redeem = () => {
  const { fnUSDBalance, wzkLTCBalance, priceNum } = useBalances();
  const [fnUSDAmount, setFnUSDAmount] = useState("");

  const parsed = parseFloat(fnUSDAmount) || 0;
  const price  = priceNum;

  const collateralGross = price > 0 ? parsed / price : 0;
  const fee             = collateralGross * REDEMPTION_FEE_FLOOR;
  const collateralOut   = collateralGross - fee;
  const feeUSD          = parsed * REDEMPTION_FEE_FLOOR;
  const hasAmount       = parsed > 0;

  const collOutDisplay = hasAmount && price > 0
    ? collateralOut.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "0.000000";

  const feeDisplay = price > 0
    ? `${fee.toLocaleString(undefined, { maximumFractionDigits: 6 })} zkLTC ≈ $${feeUSD.toFixed(2)}`
    : "0.000000 zkLTC";

  const priceDisplay = price > 0 ? `$${price.toFixed(4)}` : "Awaiting connection";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Redeem</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Burn FnUSD and receive zkLTC at the current oracle price, minus a small redemption fee.
        </p>
      </div>

      <Card className="p-5 space-y-3">
        {/* FnUSD input — shows real balance */}
        <TokenInput
          label="You burn"
          symbol="FnUSD"
          balance={fnUSDBalance}
          value={fnUSDAmount}
          onChange={setFnUSDAmount}
        />

        <div className="flex justify-center py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </div>

        {/* zkLTC output — shows real balance */}
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">You receive</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Balance: {wzkLTCBalance}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-full font-display text-3xl font-semibold tabular-nums text-foreground/80">
              {collOutDisplay}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
              <TokenIcon symbol="zkLTC" className="h-5 w-5" />
              <span className="font-display text-xs font-medium tracking-wide">zkLTC</span>
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Info className="h-3 w-3" />
              Redemption fee (min 0.50%)
            </span>
            <span className="tabular-nums text-muted-foreground">{feeDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Oracle price</span>
            <span className="tabular-nums text-muted-foreground">{priceDisplay}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Fee destination</span>
            <span className="tabular-nums text-muted-foreground">Protocol treasury</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <PrimaryButton disabled={!hasAmount}>Redeem FnUSD</PrimaryButton>
        </div>
      </Card>

      <div>
        <SectionLabel>How Redemption Works</SectionLabel>
        <Card className="p-5 space-y-0">
          <Row label="Rate"            value="1 FnUSD = $1 of zkLTC" hint="At current oracle price" />
          <Row label="Fee"             value="Min 0.50%"              hint="Rises with volume, decays over time" />
          <Row label="Fee destination" value="Treasury"               hint="Protocol revenue" />
          <Row label="Direction"       value="FnUSD to zkLTC only"    hint="One-way — burns FnUSD, releases collateral" />
        </Card>
      </div>
    </div>
  );
};

export default Redeem;
