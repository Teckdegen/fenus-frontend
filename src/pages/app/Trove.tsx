import { useState, useMemo } from "react";
import { AlertTriangle, Info, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import {
  Card, GhostButton, PrimaryButton, Row, SectionLabel, TokenInput,
} from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";
import { useTroveActions } from "@/hooks/useTroveActions";
import { TxSuccessModal } from "@/components/app/TxSuccessModal";

const MCR             = 1.30;
const BUFFER          = 1.35;
const ORIGINATION_FEE = 0.005;
const EXPLORER        = "https://liteforge.explorer.caldera.xyz/tx/";

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

function RatioBar({ ratio }: { ratio: number | null }) {
  if (!ratio) return null;
  return (
    <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${barColor(ratio)}`}
        style={{ width: `${Math.min((ratio / 3) * 100, 100)}%` }} />
    </div>
  );
}

function TxStatus({ status, txHash, error }: { status: string; txHash: string; error: string }) {
  if (status === "idle") return null;
  if (status === "approving") return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      <p className="text-[11px] text-muted-foreground">Approving WzkLTC spend…</p>
    </div>
  );
  if (status === "pending") return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      <p className="text-[11px] text-muted-foreground">Waiting for confirmation…</p>
    </div>
  );
  if (status === "success") return (
    <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
      <div>
        <p className="text-[11px] font-medium text-emerald-300">Transaction confirmed!</p>
        {txHash && (
          <a href={`${EXPLORER}${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-emerald-400/70 hover:text-emerald-400 underline">
            View on explorer
          </a>
        )}
      </div>
    </div>
  );
  if (status === "error") return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
      <p className="text-[11px] text-red-300">{error || "Transaction failed. Try again."}</p>
    </div>
  );
  return null;
}

const Trove = () => {
  const [tab, setTab]             = useState<Tab>("Open");
  const [collInput,   setCollInput]   = useState("");
  const [borrowInput, setBorrowInput] = useState("");
  const [addInput,    setAddInput]    = useState("");
  const [removeInput, setRemoveInput] = useState("");
  const [moreInput,   setMoreInput]   = useState("");
  const [repayInput,  setRepayInput]  = useState("");

  const { open } = useAppKit();

  const {
    wzkLTCBalance, wzkLTCBalanceFull, fnUSDBalance, fnUSDBalanceFull, priceNum,
    hasTrove, troveColl: existingCollStr, troveCollClose, troveDebt: existingDebtStr,
    isConnected, address,
  } = useBalances();

  const actions = useTroveActions(address as `0x${string}` | undefined);

  const existingColl = parseFloat(existingCollStr.replace(/,/g, "")) || 0;
  const closeColl      = parseFloat(troveCollClose.replace(/,/g, "")) || existingColl;
  const existingDebt = parseFloat(existingDebtStr.replace(/,/g, "")) || 0;
  const price        = priceNum;
  const priceLoaded  = price > 0;
  const busy         = actions.status === "approving" || actions.status === "pending";

  // ── Calculations ────────────────────────────────────────────────────────────
  const openCalc = useMemo(() => {
    const coll   = parseFloat(collInput)   || 0;
    const borrow = parseFloat(borrowInput) || 0;
    if (!coll && !borrow) return null;
    const fee      = borrow * ORIGINATION_FEE;
    const totalDebt = borrow + fee;
    const collUSD  = priceLoaded ? coll * price : null;
    const ratio    = collUSD !== null && totalDebt > 0 ? collUSD / totalDebt : null;
    const liqPrice = totalDebt > 0 && coll > 0 ? (totalDebt * MCR) / coll : null;
    const ratioOk  = ratio !== null ? ratio >= BUFFER : true;
    const canOpen  = coll > 0 && borrow > 0 && ratioOk;
    return { coll, borrow, fee, totalDebt, collUSD, ratio, liqPrice, canOpen };
  }, [collInput, borrowInput, price, priceLoaded]);

  const addCalc = useMemo(() => {
    const amt = parseFloat(addInput) || 0;
    const newColl = existingColl + amt;
    const collUSD = priceLoaded ? newColl * price : null;
    const ratio   = collUSD !== null && existingDebt > 0 ? collUSD / existingDebt : null;
    const liqPrice = existingDebt > 0 && newColl > 0 ? (existingDebt * MCR) / newColl : null;
    return { newColl, newDebt: existingDebt, ratio, liqPrice, safe: true };
  }, [addInput, existingColl, existingDebt, price, priceLoaded]);

  const removeCalc = useMemo(() => {
    const amt = parseFloat(removeInput) || 0;
    const newColl = existingColl - amt;
    const collUSD = priceLoaded ? newColl * price : null;
    const ratio   = collUSD !== null && existingDebt > 0 ? collUSD / existingDebt : null;
    const liqPrice = existingDebt > 0 && newColl > 0 ? (existingDebt * MCR) / newColl : null;
    const safe = newColl >= 0 && (ratio === null || ratio >= BUFFER);
    return { newColl, newDebt: existingDebt, ratio, liqPrice, safe };
  }, [removeInput, existingColl, existingDebt, price, priceLoaded]);

  const borrowCalc = useMemo(() => {
    const amt = parseFloat(moreInput) || 0;
    const fee = amt * ORIGINATION_FEE;
    const newDebt = existingDebt + amt + fee;
    const collUSD = priceLoaded ? existingColl * price : null;
    const ratio   = collUSD !== null && newDebt > 0 ? collUSD / newDebt : null;
    const liqPrice = newDebt > 0 && existingColl > 0 ? (newDebt * MCR) / existingColl : null;
    const safe = ratio === null || ratio >= BUFFER;
    return { newColl: existingColl, newDebt, ratio, liqPrice, safe, fee };
  }, [moreInput, existingColl, existingDebt, price, priceLoaded]);

  const repayCalc = useMemo(() => {
    const amt = parseFloat(repayInput) || 0;
    const newDebt = Math.max(existingDebt - amt, 0);
    const collUSD = priceLoaded ? existingColl * price : null;
    const ratio   = collUSD !== null && newDebt > 0 ? collUSD / newDebt : null;
    const liqPrice = newDebt > 0 && existingColl > 0 ? (newDebt * MCR) / existingColl : null;
    return { newColl: existingColl, newDebt, ratio, liqPrice, safe: true };
  }, [repayInput, existingColl, existingDebt, price, priceLoaded]);

  // ── Preview block ────────────────────────────────────────────────────────────
  const PreviewBlock = ({ ratio, liqPrice, newColl, newDebt, fee, safe, showFee }: {
    ratio: number | null; liqPrice: number | null;
    newColl: number; newDebt: number;
    fee?: number; safe: boolean; showFee?: boolean;
  }) => (
    <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground">Collateral Ratio</span>
          <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(ratio)}`}>
            {ratio ? `${(ratio * 100).toFixed(1)}%` : priceLoaded ? "N/A" : "Loading…"}
            {ratio && <span className="ml-1.5 text-[10px] font-normal opacity-70">{ratioLabel(ratio)}</span>}
          </span>
        </div>
        {ratio && <RatioBar ratio={ratio} />}
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

  // ── Connect prompt ───────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
          <p className="mt-1 text-sm text-muted-foreground">Deposit WzkLTC, mint FnUSD, manage your position.</p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">Connect your wallet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Connect to view your Trove, open a new position, or manage an existing one.
            </p>
          </div>
          <PrimaryButton onClick={() => open()}>Connect Wallet</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Trove</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deposit WzkLTC, mint FnUSD, manage your position.</p>
      </div>

      {/* Live price */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/20 px-4 py-2.5">
        <span className="text-[11px] text-muted-foreground">LTC/USD Oracle</span>
        <span className="font-display text-sm font-semibold tabular-nums">
          {priceLoaded ? `$${price.toFixed(4)}` : (
            <span className="text-muted-foreground animate-pulse">Fetching price…</span>
          )}
        </span>
      </div>

      <Card className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex rounded-full bg-background/60 p-1 gap-0.5">
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); actions.reset(); }}
              className={`flex-1 rounded-full py-2 text-[10px] font-medium transition leading-none ${
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}>{t}</button>
          ))}
        </div>

        {/* ── OPEN ─────────────────────────────────────────────────────── */}
        {tab === "Open" && (
          hasTrove ? (
            /* Already have a Trove — show message instead of open form */
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-8 flex flex-col items-center text-center gap-3">
              <p className="font-display text-sm font-semibold">You already have an open Trove</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                One Trove per wallet. Use the Add, Borrow, Repay, or Remove tabs to manage your existing position.
              </p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setTab("Add")}
                  className="rounded-full border border-border px-4 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition">
                  Add Collateral
                </button>
                <button onClick={() => setTab("Borrow")}
                  className="rounded-full border border-border px-4 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition">
                  Borrow More
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
            <TokenInput label="Deposit WzkLTC" symbol="zkLTC" balance={wzkLTCBalanceFull}
              value={collInput} onChange={(v) => { setCollInput(v); actions.reset(); }} />
            <TokenInput label="Borrow FnUSD" symbol="FnUSD" balance={fnUSDBalanceFull}
              value={borrowInput} onChange={(v) => { setBorrowInput(v); actions.reset(); }} />

            {openCalc && (
              <div className="rounded-2xl border border-border/60 bg-background/20 divide-y divide-border/40">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted-foreground">Collateral Ratio</span>
                    <span className={`font-display text-sm font-semibold tabular-nums ${ratioColor(openCalc.ratio)}`}>
                      {openCalc.ratio ? `${(openCalc.ratio * 100).toFixed(1)}%`
                        : priceLoaded ? "N/A"
                        : <span className="text-muted-foreground animate-pulse">Loading…</span>}
                      {openCalc.ratio && <span className="ml-1.5 text-[10px] font-normal opacity-70">{ratioLabel(openCalc.ratio)}</span>}
                    </span>
                  </div>
                  {openCalc.ratio && <RatioBar ratio={openCalc.ratio} />}
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
                {openCalc.ratio !== null && openCalc.ratio < BUFFER && openCalc.ratio > 0 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <p className="text-[11px] text-red-400">Ratio too low. Minimum 135% required.</p>
                  </div>
                )}
                {openCalc.ratio !== null && openCalc.ratio >= BUFFER && openCalc.ratio < 1.6 && (
                  <div className="px-4 py-3 flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-400 mt-0.5" />
                    <p className="text-[11px] text-orange-400">Ratio is close to the 135% minimum.</p>
                  </div>
                )}
              </div>
            )}
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-end pt-1">
              <PrimaryButton
                disabled={!openCalc?.canOpen || busy}
                onClick={() => openCalc && actions.openTrove(collInput, borrowInput)}
              >
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Open Trove"}
              </PrimaryButton>
            </div>
          </div>
          )
        )}

        {/* ── ADD ──────────────────────────────────────────────────────── */}
        {tab === "Add" && (
          <div className="space-y-3">
            <TokenInput label="Add WzkLTC" symbol="zkLTC" balance={wzkLTCBalanceFull}
              value={addInput} onChange={(v) => { setAddInput(v); actions.reset(); }} />
            {addInput && <PreviewBlock {...addCalc} safe={true} />}
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!addInput || busy}
                onClick={() => actions.addColl(addInput)}>
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Add Collateral"}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── REMOVE ───────────────────────────────────────────────────── */}
        {tab === "Remove" && (
          <div className="space-y-3">
            <TokenInput label="Remove WzkLTC" symbol="zkLTC" balance={wzkLTCBalanceFull}
              value={removeInput} onChange={(v) => { setRemoveInput(v); actions.reset(); }} />
            {removeInput && <PreviewBlock {...removeCalc} />}
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!removeInput || !removeCalc.safe || busy}
                onClick={() => actions.withdrawColl(removeInput)}>
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Remove Collateral"}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── BORROW ───────────────────────────────────────────────────── */}
        {tab === "Borrow" && (
          <div className="space-y-3">
            <TokenInput label="Borrow FnUSD" symbol="FnUSD" balance={fnUSDBalanceFull}
              value={moreInput} onChange={(v) => { setMoreInput(v); actions.reset(); }} />
            {moreInput && <PreviewBlock {...borrowCalc} showFee />}
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-end pt-1">
              <PrimaryButton disabled={!moreInput || !borrowCalc.safe || busy}
                onClick={() => actions.borrowMore(moreInput)}>
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Borrow More"}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── REPAY ────────────────────────────────────────────────────── */}
        {tab === "Repay" && (
          <div className="space-y-3">
            {/* Current debt summary */}
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Your Outstanding Debt</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Total debt</span>
                <span className="tabular-nums font-medium text-foreground">{existingDebt.toFixed(2)} FnUSD</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Your FnUSD balance</span>
                <span className="tabular-nums">{fnUSDBalanceFull} FnUSD</span>
              </div>
              {existingDebt > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Remaining after full repay</span>
                  <span className="tabular-nums">0.00 FnUSD</span>
                </div>
              )}
            </div>

            <TokenInput label="Repay FnUSD" symbol="FnUSD" balance={fnUSDBalanceFull}
              value={repayInput} onChange={(v) => { setRepayInput(v); actions.reset(); }} />
            {repayInput && <PreviewBlock {...repayCalc} safe={true} />}
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-between items-center pt-1">
              {/* Quick fill buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setRepayInput((existingDebt / 2).toFixed(6)); actions.reset(); }}
                  className="rounded-full border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition"
                >
                  50%
                </button>
                <button
                  onClick={() => { setRepayInput(existingDebt.toFixed(6)); actions.reset(); }}
                  className="rounded-full border border-border px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition"
                >
                  Max
                </button>
              </div>
              <PrimaryButton disabled={!repayInput || busy}
                onClick={() => actions.repayFnUSD(repayInput)}>
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Repay Debt"}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── CLOSE ────────────────────────────────────────────────────── */}
        {tab === "Close" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">What you repay</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Outstanding debt</span>
                <span className="tabular-nums">{existingDebt.toFixed(2)} FnUSD</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-medium">
                <span>Total to repay</span>
                <span className="tabular-nums">{existingDebt.toFixed(2)} FnUSD</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2">What you receive</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Collateral returned</span>
                <span className="tabular-nums">{closeColl.toFixed(4)} zkLTC</span>
              </div>
              {priceLoaded && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Value at current price</span>
                  <span className="tabular-nums">
                    ${(closeColl * price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 px-1">
              <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 mt-0.5" />
              <p className="text-[11px] text-muted-foreground/60">
                You need {existingDebt.toFixed(2)} FnUSD in your wallet to close.
              </p>
            </div>
            <TxStatus status={actions.status} txHash={actions.txHash} error={actions.error} />
            <div className="flex justify-end pt-1">
              <GhostButton disabled={busy} onClick={() => actions.closeTrove()}>
                {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Close Trove"}
              </GhostButton>
            </div>
          </div>
        )}
      </Card>

      <div>
        <SectionLabel>Protocol Terms</SectionLabel>
        <Card className="p-5">
          <Row label="Interest Rate"         value="0% APR"      hint="No carrying cost on your Trove" />
          <Row label="Origination Fee"       value="0.50%"       hint="One-time on each borrow, goes to treasury" />
          <Row label="Liquidation threshold" value="130%"        hint="Below this your Trove is liquidated by the bot" />
          <Row label="Minimum ratio"         value="135%"        hint="Required for all operations" />
          <Row label="Collateral"            value="WzkLTC only" />
        </Card>
      </div>

      {/* Full-screen success modal */}
      <TxSuccessModal
        data={actions.txResult}
        onClose={() => actions.reset()}
      />
    </div>
  );
};

export default Trove;
