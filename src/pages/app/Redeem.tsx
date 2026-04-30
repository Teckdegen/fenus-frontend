import { ArrowDown } from "lucide-react";
import {
  Card,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

const Redeem = () => {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Swap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Redeem FnUSD for zkLTC at face value to help maintain the peg.
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-2">
          <TokenInput label="You pay" symbol="FnUSD" balance="0.00" />
          <div className="relative flex justify-center">
            <div className="absolute -top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-card bg-foreground text-background">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <TokenInput label="You receive" symbol="zkLTC" />
        </div>

        <div className="mt-4">
          <PrimaryButton>Redeem</PrimaryButton>
        </div>
      </Card>

      <div>
        <SectionLabel>Rate</SectionLabel>
        <Card className="p-5">
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
