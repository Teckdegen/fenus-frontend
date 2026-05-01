import { useState, useMemo } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, Info } from "lucide-react";
import {
  Card,
  GhostButton,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

// ─── Constants (mirrors contracts/src/Constants.sol) ─────────────────────────
const MCR             = 1.30;  // 130% liquidation threshold (contracts only)
const BUFFER          = 1.35;  // 135% — required for ALL user operations
const ORIGINATION_FEE = 0.005; // 0.5%
const ANNUAL_RATE     = 0.01;  // 1% fixed
const MIN_DEBT        = 500;   // 500 FnUSD

// Mock oracle price — replace with live feed once connected
const MOCK_ZKLITECOIN_PRICE = 0; // $0 until wallet connected

const tabs = ["Open", "Adjust", "Close"] as const;

// ─── Ratio colour helper ──────────────────────────────────────────────────────
function ratioColor(ratio: number | null): string {
  if (!ratio) return "text-muted-foreground";
  if (ratio >= 2.0)  return "text-emerald-400";
  if (ratio >= 1.6)  return "text-yellow-400";
  if (ratio >= 1.35) return "text-orange-400";
  return "text-red-500";
}

function ratioLabel(ratio: number | null): string {
  if (!ratio) return "";
  if (ratio >= 2.0)  return "Safe";
  if (ratio >= 1.6)  return "Moderate";
  if (ratio >= 1.35) return "Risky";
  return "Below minimum";
}

// ─── Component ────────────────────────────────────────────────────────────────
const Trove = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Open");

  // Open tab inputs
  const [collInput, setCollInput]   = useState("");
  const [borrowInput, setBorrowInput] = useState("");

  // Adjust tab inputs
  const [adjCollInput, setAdjCollInput]   = useState("");
  const [adjCollDir, setAdjCollDir]       = useState<"add" | "remove">("add");
  const [adjDebtInput, setAdjDebtInput]   = useState("");
  const [adjDebtDir, setAdjDebtDir]       = useState<"borrow" | "repay">("borrow");

  // Close tab
  const [repayInput, setRepayInput] = useState("");

  // Mock existing position (replace with on-chain data when connected)
  const existingColl  = 0;   // WzkLTC
  const existingDebt  = 0;   // FnUSD
  const price = MOCK_ZKLITECOIN_PRICE;

  // ─── Open tab calculations ──────────────────────────────────────────────────
  const openCalc = useMemo(() => {
    const coll   = parseFloat(collInput)   || 0;
    const borrow = parseFloat(borrowInput) || 0;
    if (coll === 0 && borrow === 0) return null;

    const fee      = borrow * ORIGINATION_FEE;
    const totalDebt = borrow + fee;
    const collUSD  = price > 0 ? coll * price : 0;
    const ratio    = totalDebt > 0 && collUSD > 0 ? collUSD / totalDebt : null;
    const liqPrice = totalDebt > 0 && coll > 0 ? (totalDebt * MCR) / coll : null;
    const canOpen  = ratio !== null && ratio >= BUFFER && totalDebt >= MIN_DEBT;

    // Interest projections
    const interest1y  = totalDebt * ANNUAL_RATE;
    const interest6m  = interest1y / 2;
    const debtAfter1y = totalDebt + interest1y;

    return { coll, borrow, fee, totalDebt, collUSD, ratio, liqPrice, canOpen, interest1y, interest6m, debtAfter1y };
  }, [collInput, borrowInput, price]);

  // ─── Adjust tab calculations ────────────────────────────────────────────────
  const adjCalc = useMemo(() => {
    const adjColl = parseFloat(adjCollInput) || 0;
    const adjDebt = parseFloat(adjDebtInput) || 0;

    const newColl = adjCollDir === "add"
      ? existingColl + adjColl
      : existingColl - adjColl;

    const fee = adjDebtDir === "borrow" ? adjDebt * ORIGINATION_FEE : 0;
    const newDebt = adjDebtDir === "borrow"
      ? existingDebt + adjDebt + fee
      : existingDebt - adjDebt;

    const collUSD  = price > 0 ? newColl * price : 0;
    const ratio    = newDebt > 0 && collUSD > 0 ? collUSD / newDebt : null;
    const liqPrice = newDebt > 0 && newColl > 0 ? (newDebt * MCR) / newColl : null;
    const safe     = ratio !== null ? ratio >= BUFFER : true;

    return { newColl, newDebt, collUSD, ratio, liqPrice, safe, fee };
  }, [adjCollInput, adjCollDir, adjDebtInput, adjDebtDir, existingColl, existingDebt, price]);

  // ─── Close tab ──────────────────────────────────────────────────────────────
  const closeDebt = existingDebt; // full debt including accrued interest

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit WzkLTC, mint FnUSD, manage your position.
        </p>
      </div>

      {/* Tab switcher */}
      <Card className="p-4 space-y-4">
        <div className="flex rounded-full bg-background/60 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-medium transition ${
                tab === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── OPEN ─────────────────────────────────────────────────────────── */}
        {tab === "Open" && (
          <div className="space-y-3">
            <TokenInput
              label="Deposit WzkLTC"
              symbol="zkLTC"
              balance="0.00"
              value={collInput}
              onChange={setCollInput}
            />
            <TokenInput
              label="Borrow FnUSD"
              symbol="FnUSD"
              balance="0.00"
              value={borrowInput}
              onChange={setBorrowInput}
            />

            {/* Live preview — shows as soon as user types */}
            {openCalc && (
              <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">

                {/* Ratio bar */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted-foreground">Collateral Ratio</span>
                    <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(openCalc.ratio)}`}>
                      {openCalc.ratio ? `${(openCalc.ratio * 100).toFixed(1)}%` : "N/A"}
                      {openCalc.ratio && (
                        <span className="ml-1.5 text-[10px] font-normal opacity-70">
                          {ratioLabel(openCalc.ratio)}
                        </span>
                      )}
                    </span>
                  </div>
                  {openCalc.ratio && (
                    <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          openCalc.ratio >= 2.0 ? "bg-emerald-400" :
                          openCalc.ratio >= 1.5 ? "bg-yellow-400" :
                          openCalc.ratio >= 1.35 ? "bg-orange-400" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min((openCalc.ratio / 3) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Key numbers */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Liquidation price</span>
                    <span className="tabular-nums font-medium">
                      {openCalc.liqPrice ? `$${openCalc.liqPrice.toFixed(4)} / zkLTC` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Collateral value</span>
                    <span className="tabular-nums">
                      {price > 0 ? `$${openCalc.collUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `${openCalc.coll} zkLTC`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Origination fee (0.5%)</span>
                    <span className="tabular-nums">{openCalc.fee.toFixed(2)} FnUSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Total debt at open</span>
                    <span className="tabular-nums font-medium">{openCalc.totalDebt.toFixed(2)} FnUSD</span>
                  </div>
                </div>

                {/* Interest projections */}
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Interest projections (1% APR)
                  </p>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">After 6 months</span>
                    <span className="tabular-nums">+{openCalc.interest6m.toFixed(2)} FnUSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">After 1 year</span>
                    <span className="tabular-nums">+{openCalc.interest1y.toFixed(2)} FnUSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Debt after 1 year</span>
                    <span className="tabular-nums font-medium">{openCalc.debtAfter1y.toFixed(2)} FnUSD</span>
                  </div>
                </div>

                {/* Warnings */}
                {openCalc.ratio !== null && openCalc.ratio < BUFFER && openCalc.ratio > 0 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-[11px] text-red-400">
                      Ratio too low. Minimum 135% required for all operations. Add more collateral or borrow less.
                    </p>
                  </div>
                )}
                {openCalc.totalDebt > 0 && openCalc.totalDebt < MIN_DEBT && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-400 mt-0.5" />
                    <p className="text-[11px] text-orange-400">
                      Minimum debt is 500 FnUSD.
                    </p>
                  </div>
                )}
                {openCalc.ratio !== null && openCalc.ratio >= BUFFER && openCalc.ratio < 1.6 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-400 mt-0.5" />
                    <p className="text-[11px] text-orange-400">
                      Your ratio is close to the 135% minimum. A small price drop could block future withdrawals.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!openCalc?.canOpen}>
                Open Trove
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── ADJUST ───────────────────────────────────────────────────────── */}
        {tab === "Adjust" && (
          <div className="space-y-3">

            {/* Current position summary */}
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Current Position</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Collateral</span>
                <span className="tabular-nums">{existingColl.toFixed(4)} zkLTC</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Debt</span>
                <span className="tabular-nums">{existingDebt.toFixed(2)} FnUSD</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Ratio</span>
                <span className={`tabular-nums font-medium ${ratioColor(
                  existingDebt > 0 && price > 0 ? (existingColl * price) / existingDebt : null
                )}`}>
                  {existingDebt > 0 && price > 0
                    ? `${((existingColl * price / existingDebt) * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Collateral adjustment */}
            <div className="space-y-2">
              <div className="flex rounded-full bg-background/60 p-0.5 w-fit">
                {(["add", "remove"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setAdjCollDir(d)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-medium capitalize transition ${
                      adjCollDir === d ? "bg-foreground text-background" : "text-muted-foreground"
                    }`}
                  >
                    {d === "add" ? "Add Collateral" : "Remove Collateral"}
                  </button>
                ))}
              </div>
              <TokenInput
                label={adjCollDir === "add" ? "Add WzkLTC" : "Remove WzkLTC"}
                symbol="zkLTC"
                balance="0.00"
                value={adjCollInput}
                onChange={setAdjCollInput}
              />
            </div>

            {/* Debt adjustment */}
            <div className="space-y-2">
              <div className="flex rounded-full bg-background/60 p-0.5 w-fit">
                {(["borrow", "repay"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setAdjDebtDir(d)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-medium capitalize transition ${
                      adjDebtDir === d ? "bg-foreground text-background" : "text-muted-foreground"
                    }`}
                  >
                    {d === "borrow" ? "Borrow More" : "Repay Debt"}
                  </button>
                ))}
              </div>
              <TokenInput
                label={adjDebtDir === "borrow" ? "Borrow FnUSD" : "Repay FnUSD"}
                symbol="FnUSD"
                balance="0.00"
                value={adjDebtInput}
                onChange={setAdjDebtInput}
              />
            </div>

            {/* Adjust preview */}
            {(adjCollInput || adjDebtInput) && (
              <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted-foreground">New Collateral Ratio</span>
                    <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(adjCalc.ratio)}`}>
                      {adjCalc.ratio ? `${(adjCalc.ratio * 100).toFixed(1)}%` : "N/A"}
                    </span>
                  </div>
                  {adjCalc.ratio && (
                    <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          adjCalc.ratio >= 2.0 ? "bg-emerald-400" :
                          adjCalc.ratio >= 1.5 ? "bg-yellow-400" :
                          adjCalc.ratio >= 1.35 ? "bg-orange-400" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min((adjCalc.ratio / 3) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">New liquidation price</span>
                    <span className="tabular-nums">
                      {adjCalc.liqPrice ? `$${adjCalc.liqPrice.toFixed(4)} / zkLTC` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">New collateral</span>
                    <span className="tabular-nums">{adjCalc.newColl.toFixed(4)} zkLTC</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">New debt</span>
                    <span className="tabular-nums">{adjCalc.newDebt.toFixed(2)} FnUSD</span>
                  </div>
                  {adjCalc.fee > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Origination fee (0.5%)</span>
                      <span className="tabular-nums">{adjCalc.fee.toFixed(2)} FnUSD</span>
                    </div>
                  )}
                </div>
                {!adjCalc.safe && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-[11px] text-red-400">
                      This adjustment would put your ratio below 135%. The contract will reject it.
                      Reduce the change or add more collateral first.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!adjCalc.safe && !!(adjCollInput || adjDebtInput)}>
                Update Trove
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── CLOSE ────────────────────────────────────────────────────────── */}
        {tab === "Close" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                What you repay
              </p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Outstanding debt</span>
                <span className="tabular-nums">{closeDebt.toFixed(2)} FnUSD</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Accrued interest</span>
                <span className="tabular-nums text-muted-foreground/60">included above</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-medium">
                <span>Total to repay</span>
                <span className="tabular-nums">{closeDebt.toFixed(2)} FnUSD</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">
                What you receive
              </p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Collateral returned</span>
                <span className="tabular-nums">{existingColl.toFixed(4)} zkLTC</span>
              </div>
              {price > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Value at current price</span>
                  <span className="tabular-nums">
                    ${(existingColl * price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 px-1">
              <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 mt-0.5" />
              <p className="text-[11px] text-muted-foreground/60">
                Make sure you hold at least {closeDebt.toFixed(2)} FnUSD in your wallet before closing.
                If you don't have enough, buy FnUSD on Addax first.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <GhostButton>Close Trove</GhostButton>
            </div>
          </div>
        )}
      </Card>

      {/* ── Protocol info — always visible ─────────────────────────────────── */}
      <div>
        <SectionLabel>Protocol Terms</SectionLabel>
        <Card className="p-5">
          <Row label="Interest Rate"        value="1.00% APR"   hint="Fixed — accrues continuously to treasury" />
          <Row label="Origination Fee"      value="0.50%"       hint="One-time on each borrow, goes to treasury" />
          <Row label="Liquidation threshold" value="130%"       hint="Below this your Trove is liquidated by the bot" />
          <Row label="Minimum ratio"        value="135%"        hint="Required for all operations — open, withdraw, borrow more" />
          <Row label="Min Debt"             value="500 FnUSD"   hint="Minimum position size" />
          <Row label="Collateral"           value="WzkLTC only" />
        </Card>
      </div>
    </div>
  );
};

export default Trove;
