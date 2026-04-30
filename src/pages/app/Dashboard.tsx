import { ArrowDownToLine, ArrowUpRight, Repeat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ActionPill,
  Card,
  Row,
  SectionLabel,
  TokenRow,
} from "@/components/app/Shared";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Balance hero */}
      <Card className="overflow-hidden p-6 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Net Worth
        </p>
        <p className="mt-3 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text font-display text-5xl font-semibold tracking-tight text-transparent">
          $0.00
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">+0.00% · 24h</p>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-2.5">
        <Link to="/app/trove" className="flex-1">
          <ActionPill label="Borrow" icon={ArrowDownToLine} />
        </Link>
        <Link to="/app/redeem" className="flex-1">
          <ActionPill label="Swap" icon={Repeat} />
        </Link>
        <Link to="/app/stability" className="flex-1">
          <ActionPill label="Earn" icon={Sparkles} />
        </Link>
        <ActionPill label="Send" icon={ArrowUpRight} />
      </div>

      {/* Tokens */}
      <div>
        <SectionLabel>Tokens</SectionLabel>
        <Card className="p-2">
          <TokenRow symbol="zkLTC" name="LiteVM Litecoin" amount="0.0000" value="$0.00" />
          <TokenRow symbol="FnUSD" name="Fenus Dollar" amount="0.00" value="$0.00" />
        </Card>
      </div>

      {/* Trove summary */}
      <div>
        <SectionLabel>Your Trove</SectionLabel>
        <Card className="p-5">
          <Row label="Collateral" value="0.0000 zkLTC" />
          <Row label="Debt" value="0.00 FnUSD" />
          <Row label="Coll. Ratio" value="—" hint="Min 110%" />
          <Row label="Liq. Price" value="—" />
          <div className="mt-4">
            <Link
              to="/app/trove"
              className="block w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Manage Trove
            </Link>
          </div>
        </Card>
      </div>

      {/* Protocol */}
      <div>
        <SectionLabel>Protocol</SectionLabel>
        <Card className="p-5">
          <Row label="TVL" value="$0" />
          <Row label="FnUSD Minted" value="$0" />
          <Row label="Stability APY" value="0.00%" />
          <Row label="Redemption Fee" value="0.50%" />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
