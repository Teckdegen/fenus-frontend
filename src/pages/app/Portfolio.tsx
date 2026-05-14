import { Link } from "react-router-dom";
import { Wallet, ExternalLink } from "lucide-react";
import { Card, SectionLabel, Row } from "@/components/app/Shared";
import { usePortfolio, type ActivityItem, type ActivityType } from "@/hooks/usePortfolio";
import { useBalances } from "@/hooks/useBalances";

// ─── Activity type metadata ───────────────────────────────────────────────────

const ACTIVITY_META: Record<ActivityType, { label: string }> = {
  TroveOpened:         { label: "Trove Opened" },
  CollateralAdded:     { label: "Collateral Added" },
  CollateralWithdrawn: { label: "Collateral Withdrawn" },
  FnUSDBorrowed:       { label: "FnUSD Borrowed" },
  FnUSDRepaid:         { label: "FnUSD Repaid" },
  TroveClosed:         { label: "Trove Closed" },
  TroveLiquidated:     { label: "Liquidated" },
};

const EXPLORER = "https://liteforge.explorer.caldera.xyz";

// ─── Component ────────────────────────────────────────────────────────────────

const Portfolio = () => {
  const { activities, stats, isLoading, isConnected } = usePortfolio();
  const { hasTrove, troveColl, troveDebt, troveRatio, troveLiqPrice } = useBalances();

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your wallet to view your protocol activity.
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Wallet not connected</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your complete protocol activity, position history, and usage stats.
        </p>
      </div>

      {/* ─── Stats Overview ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Interactions" value={stats?.totalInteractions.toString() ?? "0"} />
        <StatCard label="Total Borrowed" value={`${stats?.totalBorrowed ?? "0"} FnUSD`} />
        <StatCard label="Total Repaid" value={`${stats?.totalRepaid ?? "0"} FnUSD`} />
        <StatCard label="Coll. Deposited" value={`${stats?.totalCollDeposited ?? "0"} wzkLTC`} />
      </div>

      {/* ─── Current Position ────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Current Position</SectionLabel>
        <Card className="p-5">
          {hasTrove ? (
            <>
              <Row label="Collateral" value={`${troveColl} wzkLTC`} />
              <Row label="Debt" value={`${troveDebt} FnUSD`} />
              <Row label="Collateral Ratio" value={troveRatio} hint="Min 130%" />
              <Row label="Liquidation Price" value={`${troveLiqPrice}`} hint="per wzkLTC" />
              <div className="mt-4 flex justify-end">
                <Link
                  to="/app/trove"
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90"
                >
                  Manage Trove
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No active Trove</p>
              <Link
                to="/app/trove"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90"
              >
                Open a Trove
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Position History Summary ────────────────────────────────────── */}
      <div>
        <SectionLabel>Position History</SectionLabel>
        <Card className="p-5">
          <Row label="Troves Opened" value={stats?.troveOpenCount ?? 0} />
          <Row label="Troves Closed" value={stats?.troveCloseCount ?? 0} />
          <Row label="Total Coll. Deposited" value={`${stats?.totalCollDeposited ?? "0"} wzkLTC`} />
          <Row label="Total Coll. Withdrawn" value={`${stats?.totalCollWithdrawn ?? "0"} wzkLTC`} />
          <Row label="Total FnUSD Borrowed" value={`${stats?.totalBorrowed ?? "0"} FnUSD`} />
          <Row label="Total FnUSD Repaid" value={`${stats?.totalRepaid ?? "0"} FnUSD`} />
        </Card>
      </div>

      {/* ─── Activity Feed ───────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Activity Feed</SectionLabel>
        <Card className="divide-y divide-border/40">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
              <span className="ml-3 text-sm text-muted-foreground">Loading activity…</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Open a Trove or use the faucet to get started.
              </p>
            </div>
          ) : (
            activities.slice(0, 50).map((item, i) => (
              <ActivityRow key={`${item.txHash}-${i}`} item={item} />
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = ACTIVITY_META[item.type];

  let detail = "";
  if (item.type === "TroveOpened" && item.coll && item.debt) {
    detail = `${fmtNum(item.coll)} wzkLTC / ${fmtNum(item.debt)} FnUSD`;
  } else if (item.amount) {
    const unit = item.type.includes("Coll") ? "wzkLTC" : "FnUSD";
    detail = `${fmtNum(item.amount)} ${unit}`;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{meta.label}</p>
        {detail && (
          <p className="text-[11px] text-muted-foreground truncate">{detail}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
          Block {item.blockNumber.toString()}
        </span>
        <a
          href={`${EXPLORER}/tx/${item.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground/40 hover:text-foreground transition"
          aria-label="View on explorer"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function fmtNum(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
}

export default Portfolio;
