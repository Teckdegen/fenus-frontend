import { useState, useMemo } from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Card,
  GhostButton,
  PrimaryButton,
  Row,
  SectionLabel,
  TokenInput,
} from "@/components/app/Shared";

const MCR             = 1.30;
const BUFFER          = 1.35;
const ORIGINATION_FEE = 0.005;
const ANNUAL_RATE     = 0.01;
const MIN_DEBT        = 500;
const MOCK_PRICE      = 0;

const TABS = ["Open", "Add", "Remove", "Borrow", "Repay", "Close"] as const;
type Tab = (typeof TABS)[number];

function ratioColor(r: number | null) {
  if (!r) return "text-muted-foreground";
  if (r >= 2.0) return "text-emerald-400";
  if (r >= 1.6) return "text-yellow-400";
  if (r >= 1.35) return "text-orange-400";
  return "text-red-500";
}
function ratioLabel(r: number | null) {
  if (!r) return "";
  if (r >= 2.0) return "Safe";
  if (r >= 1.6) return "Moderate";
  if (r >= 1.35) return "Risky";
  return "Below minimum";
}
function barColor(r: number) {
  if (r >= 2.0) return "bg-emerald-400";
  if (r >= 1.6) return "bg-yellow-400";
  if (r >= 1.35) return "bg-orange-400";
  return "bg-red-500";
}

function Preview({
  ratio, liqPrice, newColl, newDebt, fee, safe, showFee,
}: {
  ratio: number | null; liqPrice: number | null;
  newColl: number; newDebt: number;
  fee?: number; safe: boolean; showFee?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Collateral Ratio</span>
          <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(ratio)}`}>
            {ratio ? `${(ratio * 100).toFixed(1)}%` : "N/A"}
            {ratio && <span className="ml-1.5 text-[10px] font-normal opacity-70">{ratioLabel(ratio)}</span>}
          </span>
        </div>
        {ratio && (
          <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor(ratio)}`}
              style={{ width: `${Math.min((ratio / 3) * 100, 100)}%` }} />
          </div>
        )}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Liquidation price</span>
          <span className="tabular-nums font-medium">
            {liqPrice ? `$${liqPrice.toFixed(4)} / zkLTC` : "N/A"}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">New collateral</span>
          <span className="tabular-nums">{newColl.toFixed(4)} zkLTC</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">New debt</span>
          <span className="tabular-nums">{newDebt.toFixed(2)} FnUSD</span>
        </div>
        {showFee && fee !== undefined && fee > 0 && (
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Origination fee (0.5%)</span>
            <span className="tabular-nums">{fee.toFixed(2)} FnUSD</span>
          </div>
        )}
      </div>
      {!safe && (
        <div className="px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
          <p className="text-[11px] text-red-400">
            This would drop your ratio below 135%. The contract will reject it.
          </p>
        </div>
      )}
    </div>
  );
}

const Trove = () => {
  const [tab, setTab] = useState<Tab>("Open");

  const [collInput,   setCollInput]   = useState("");
  const [borrowInput, setBorrowInput] = useState("");
  const [addInput,    setAddInput]    = useState("");
  const [removeInput, setRemoveInput] = useState("");
  const [moreInput,   setMoreInput]   = useState("");
  const [repayInput,  setRepayInput]  = useState("");

  const existingColl = 0;
  const existingDebt = 0;
  const price        = MOCK_PRICE;

  // Open
  const openCalc = useMemo(() => {
    const coll   = parseFloat(collInput)   || 0;
    const borrow = parseFloat(borrowInput) || 0;
    if (!coll && !borrow) return null;
    const fee       = borrow * ORIGINATION_FEE;
    const totalDebt = borrow + fee;
    const collUSD   = price > 0 ? coll * price : 0;
    const ratio     = totalDebt > 0 && collUSD > 0 ? collUSD / totalDebt : null;
    const liqPrice  = totalDebt > 0 && coll > 0 ? (totalDebt * MCR) / coll : null;
    const canOpen   = ratio !== null && ratio >= BUFFER && totalDebt >= MIN_DEBT;
    const int6m     = totalDebt * ANNUAL_RATE / 2;
    const int1y     = totalDebt * ANNUAL_RATE;
    return { coll, fee, totalDebt, collUSD, ratio, liqPrice, canOpen, int6m, int1y };
  }, [collInput, borrowInput, price]);

  // Add collateral
  const addCalc = useMemo(() => {
    const amt      = parseFloat(addInput) || 0;
    const newColl  = existingColl + amt;
    const ratio    = existingDebt > 0 && price > 0 ? (newColl * price) / existingDebt : null;
    const liqPrice = existingDebt > 0 && newColl > 0 ? (existingDebt * MCR) / newColl : null;
    return { newColl, newDebt: existingDebt, ratio, liqPrice, safe: true };
  }, [addInput, existingColl, existingDebt, price]);

  // Remove collateral
  const removeCalc = useMemo(() => {
    const amt      = parseFloat(removeInput) || 0;
    const newColl  = existingColl - amt;
    const collUSD  = price > 0 ? newColl * price : 0;
    const ratio    = existingDebt > 0 && collUSD > 0 ? collUSD / existingDebt : null;
    const liqPrice = existingDebt > 0 && newColl > 0 ? (existingDebt * MCR) / newColl : null;
    const safe     = newColl >= 0 && (ratio === null || ratio >= BUFFER);
    return { newColl, newDebt: existingDebt, ratio, liqPrice, safe };
  }, [removeInput, existingColl, existingDebt, price]);

  // Borrow more
  const borrowCalc = useMemo(() => {
    const amt      = parseFloat(moreInput) || 0;
    const fee      = amt * ORIGINATION_FEE;
    const newDebt  = existingDebt + amt + fee;
    const collUSD  = price > 0 ? existingColl * price : 0;
    const ratio    = newDebt > 0 && collUSD > 0 ? collUSD / newDebt : null;
    const liqPrice = newDebt > 0 && existingColl > 0 ? (newDebt * MCR) / existingColl : null;
    const safe     = ratio === null || ratio >= BUFFER;
    return { newColl: existingColl, newDebt, ratio, liqPrice, safe, fee };
  }, [moreInput, existingColl, existingDebt, price]);

  // Repay
  const repayCalc = useMemo(() => {
    const amt      = parseFloat(repayInput) || 0;
    const newDebt  = Math.max(existingDebt - amt, 0);
    const collUSD  = price > 0 ? existingColl * price : 0;
    const ratio    = newDebt > 0 && collUSD > 0 ? collUSD / newDebt : null;
    const liqPrice = newDebt > 0 && existingColl > 0 ? (newDebt * MCR) / existingColl : null;
    return { newColl: existingColl, newDebt, ratio, liqPrice, safe: true };
  }, [repayInput, existingColl, existingDebt, price]);

  const closeDebt = existingDebt;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit WzkLTC, mint FnUSD, manage your position.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        {/* Tab bar — 6 equal pills, small text so they all fit */}
        <div className="flex rounded-full bg-background/60 p-1 gap-0.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 text-[10px] font-medium transition leading-none ${
                tab === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── OPEN ─────────────────────────────────────────────────────── */}
        {tab === "Open" && (
          <div className="space-y-3">
            <TokenInput label="Deposit WzkLTC" symbol="zkLTC" balance="0.00"
              value={collInput} onChange={setCollInput} />
            <TokenInput label="Borrow FnUSD" symbol="FnUSD" balance="0.00"
              value={borrowInput} onChange={setBorrowInput} />

            {openCalc && (
              <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted-foreground">Collateral Ratio</span>
                    <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(openCalc.ratio)}`}>
                      {openCalc.ratio ? `${(openCalc.ratio * 100).toFixed(1)}%` : "N/A"}
                      {openCalc.ratio && <span className="ml-1.5 text-[10px] font-normal opacity-70">{ratioLabel(openCalc.ratio)}</span>}
                    </span>
                  </div>
                  {openCalc.ratio && (
                    <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor(openCalc.ratio)}`}
                        style={{ width: `${Math.min((openCalc.ratio / 3) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Liquidation price</span>
                    <span className="tabular-nums font-medium">
                      {openCalc.liqPrice ? `$${openCalc.liqPrice.toFixed(4)} / zkLTC` : "N/A"}
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
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                    Interest projections (1% APR)
                  </p>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">After 6 months</span>
                    <span className="tabular-nums">+{openCalc.int6m.toFixed(2)} FnUSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">After 1 year</span>
                    <span className="tabular-nums">+{openCalc.int1y.toFixed(2)} FnUSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Debt after 1 year</span>
                    <span className="tabular-nums font-medium">
                      {(openCalc.totalDebt + openCalc.int1y).toFixed(2)} FnUSD
                    </span>
                  </div>
                </div>
                {openCalc.ratio !== null && openCalc.ratio < BUFFER && openCalc.ratio > 0 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-[11px] text-red-400">
                      Ratio too low. Minimum 135% required. Add more collateral or borrow less.
                    </p>
                  </div>
                )}
                {openCalc.totalDebt > 0 && openCalc.totalDebt < MIN_DEBT && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-400 mt-0.5" />
                    <p className="text-[11px] text-orange-400">Minimum debt is 500 FnUSD.</p>
                  </div>
                )}
                {openCalc.ratio !== null && openCalc.ratio >= BUFFER && openCalc.ratio < 1.6 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-400 mt-0.5" />
                    <p className="text-[11px] text-orange-400">
                      Ratio is close to the 135% minimum. Consider adding more collateral.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!openCalc?.canOpen}>Open Trove</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── ADD COLLATERAL ───────────────────────────────────────────── */}
        {tab === "Add" && (
          <div className="space-y-3">
            <TokenInput label="Add WzkLTC" symbol="zkLTC" balance="0.00"
              value={addInput} onChange={setAddInput} />
            {addInput && <Preview {...addCalc} safe={true} />}
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!addInput}>Add Collateral</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── REMOVE COLLATERAL ────────────────────────────────────────── */}
        {tab === "Remove" && (
          <div className="space-y-3">
            <TokenInput label="Remove WzkLTC" symbol="zkLTC" balance="0.00"
              value={removeInput} onChange={setRemoveInput} />
            {removeInput && <Preview {...removeCalc} />}
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!removeInput || !removeCalc.safe}>
                Remove Collateral
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── BORROW MORE ──────────────────────────────────────────────── */}
        {tab === "Borrow" && (
          <div className="space-y-3">
            <TokenInput label="Borrow FnUSD" symbol="FnUSD" balance="0.00"
              value={moreInput} onChange={setMoreInput} />
            {moreInput && <Preview {...borrowCalc} showFee />}
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!moreInput || !borrowCalc.safe}>
                Borrow More
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── REPAY DEBT ───────────────────────────────────────────────── */}
        {tab === "Repay" && (
          <div className="space-y-3">
            <TokenInput label="Repay FnUSD" symbol="FnUSD" balance="0.00"
              value={repayInput} onChange={setRepayInput} />
            {repayInput && <Preview {...repayCalc} safe={true} />}
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!repayInput}>Repay Debt</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── CLOSE ────────────────────────────────────────────────────── */}
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
                You need {closeDebt.toFixed(2)} FnUSD in your wallet to close.
                If you don't have enough, buy FnUSD on Addax first.
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <GhostButton>Close Trove</GhostButton>
            </div>
          </div>
        )}
      </Card>

      {/* Protocol Terms */}
      <div>
        <SectionLabel>Protocol Terms</SectionLabel>
        <Card className="p-5">
          <Row label="Interest Rate"         value="1.00% APR"   hint="Fixed — accrues continuously to treasury" />
          <Row label="Origination Fee"       value="0.50%"       hint="One-time on each borrow, goes to treasury" />
          <Row label="Liquidation threshold" value="130%"        hint="Below this your Trove is liquidated by the bot" />
          <Row label="Minimum ratio"         value="135%"        hint="Required for all operations" />
          <Row label="Min Debt"              value="500 FnUSD"   hint="Minimum position size" />
          <Row label="Collateral"            value="WzkLTC only" />
        </Card>
      </div>
    </div>
  );
};

export default Trove;
