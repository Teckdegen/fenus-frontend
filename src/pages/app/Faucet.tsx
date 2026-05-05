import { useState, useEffect } from "react";
import { Droplets, CheckCircle2, Loader2, AlertTriangle, Wallet, Clock } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { Card, PrimaryButton, Row, SectionLabel, TokenIcon } from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";
import { TxSuccessModal } from "@/components/app/TxSuccessModal";
import { useQueryClient } from "@tanstack/react-query";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const EXPLORER    = "https://liteforge.explorer.caldera.xyz/tx/";

function getCooldownKey(addr: string) {
  return `faucet_last_claim_${addr.toLowerCase()}`;
}
function getTimeLeft(addr: string): number {
  const last = parseInt(localStorage.getItem(getCooldownKey(addr)) || "0");
  return Math.max(0, COOLDOWN_MS - (Date.now() - last));
}
function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Ready";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const Faucet = () => {
  const { open } = useAppKit();
  const { isConnected, address, wzkLTCBalanceFull } = useBalances();
  const queryClient = useQueryClient();

  const [status,    setStatus]    = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash,    setTxHash]    = useState("");
  const [error,     setError]     = useState("");
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [modalData, setModalData] = useState<{ type: string; amount: string; txHash: string } | null>(null);

  // Update countdown every second
  useEffect(() => {
    if (!address) return;
    setTimeLeft(getTimeLeft(address));
    const id = setInterval(() => setTimeLeft(getTimeLeft(address)), 1_000);
    return () => clearInterval(id);
  }, [address]);

  const onCooldown = timeLeft > 0;
  const canClaim   = isConnected && !onCooldown && status !== "pending";
  const busy       = status === "pending";

  const handleClaim = async () => {
    if (!canClaim || !address) return;
    setStatus("pending");
    setError("");
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If server says cooldown active, sync localStorage
        if (res.status === 429 && data.remainingMs) {
          const lastClaim = Date.now() - (COOLDOWN_MS - data.remainingMs);
          localStorage.setItem(getCooldownKey(address), lastClaim.toString());
          setTimeLeft(data.remainingMs);
        }
        throw new Error(data.error || "Faucet request failed");
      }
      setTxHash(data.txHash);
      // Record claim time in localStorage for UI countdown
      localStorage.setItem(getCooldownKey(address), Date.now().toString());
      setTimeLeft(COOLDOWN_MS);
      setStatus("success");
      setModalData({ type: "Faucet Claim", amount: "1,000 wzkLTC", txHash: data.txHash });
      setTimeout(() => queryClient.invalidateQueries(), 3000);
    } catch (e: any) {
      setError(e?.message || "Request failed. Try again.");
      setStatus("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Faucet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get 1,000 wzkLTC every 24 hours to test the protocol.</p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">Connect your wallet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Connect to claim 1,000 wzkLTC for testing.
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Faucet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get 1,000 wzkLTC every 24 hours to test the protocol.
        </p>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <TokenIcon symbol="wzkLTC" className="h-6 w-6" />
          <span className="text-sm text-muted-foreground">Your wzkLTC balance</span>
        </div>
        <span className="font-display text-sm font-semibold tabular-nums">
          {wzkLTCBalanceFull} wzkLTC
        </span>
      </div>

      <Card className="p-8 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <TokenIcon symbol="wzkLTC" className="h-16 w-16" />
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight">1,000</p>
            <p className="text-sm text-muted-foreground mt-1">wzkLTC per claim</p>
          </div>
        </div>

        {/* Status pill */}
        {onCooldown ? (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-300">
              Next claim in <span className="font-bold">{formatTimeLeft(timeLeft)}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/20 px-4 py-2">
            <Droplets className="h-3.5 w-3.5 text-foreground/60" />
            <span className="text-[11px] font-medium">Ready to claim</span>
          </div>
        )}

        {status === "pending" && (
          <div className="flex items-center gap-2 w-full rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Sending wzkLTC to your wallet…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-start gap-2 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="text-left">
              <p className="text-[11px] font-medium text-emerald-300">1,000 wzkLTC sent to your wallet</p>
              {txHash && (
                <a href={`${EXPLORER}${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400/70 hover:text-emerald-400 underline">
                  View on explorer
                </a>
              )}
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
            <p className="text-[11px] text-red-300">{error}</p>
          </div>
        )}

        <PrimaryButton disabled={!canClaim || busy} onClick={handleClaim} className="px-16">
          {busy ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Sending…</>
          ) : onCooldown ? (
            `Available in ${formatTimeLeft(timeLeft)}`
          ) : (
            "Claim 1,000 wzkLTC"
          )}
        </PrimaryButton>
      </Card>

      <div>
        <SectionLabel>Details</SectionLabel>
        <Card className="p-5">
          <Row label="Your wzkLTC"   value={`${wzkLTCBalanceFull} wzkLTC`} />
          <Row label="Amount"        value="1,000 wzkLTC per claim" />
          <Row label="Cooldown"      value="24 hours per wallet" />
          <Row label="No gas needed" value="Faucet pays gas on your behalf" />
          <Row label="Network"       value="LitVM LiteForge" />
        </Card>
      </div>

      <TxSuccessModal data={modalData} onClose={() => setModalData(null)} />
    </div>
  );
};

export default Faucet;
