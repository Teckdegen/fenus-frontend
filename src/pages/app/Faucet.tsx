import { useState } from "react";
import { Droplets, CheckCircle2, Loader2, AlertTriangle, Wallet, Clock } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useWriteContract, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Card, PrimaryButton, Row, SectionLabel, TokenIcon } from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";
import { CONTRACTS } from "@/lib/contracts";

// Faucet drips 1000 WzkLTC every 48 hours.
// The admin wallet calls adminMint() on behalf of the user.
// Since adminMint is restricted to the admin, we track cooldowns client-side
// using localStorage and the actual mint is done server-side or by the admin.
// For a fully trustless faucet, deploy a separate Faucet.sol contract.

const WZKLITECOIN_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "adminMint", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [] },
] as const;

const FAUCET_AMOUNT   = BigInt(1000 * 10 ** 8); // 1000 WzkLTC (8 decimals)
const COOLDOWN_MS     = 48 * 60 * 60 * 1000;    // 48 hours
const EXPLORER        = "https://liteforge.explorer.caldera.xyz/tx/";

function getCooldownKey(address: string) {
  return `faucet_last_claim_${address.toLowerCase()}`;
}

function getTimeLeft(address: string): number {
  const last = parseInt(localStorage.getItem(getCooldownKey(address)) || "0");
  const elapsed = Date.now() - last;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "Ready";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const Faucet = () => {
  const { open } = useAppKit();
  const { isConnected, address, wzkLTCBalance, raw } = useBalances();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [error,  setError]  = useState("");
  const [, forceUpdate]     = useState(0);

  const timeLeft  = address ? getTimeLeft(address) : COOLDOWN_MS;
  const canClaim  = isConnected && timeLeft === 0 && status !== "pending";
  const busy      = status === "pending";

  const handleClaim = async () => {
    if (!canClaim || !address) return;
    setStatus("pending");
    setError("");
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.WzkLTC as `0x${string}`,
        abi: WZKLITECOIN_ABI,
        functionName: "adminMint",
        args: [address as `0x${string}`, FAUCET_AMOUNT],
      });
      setTxHash(hash);
      localStorage.setItem(getCooldownKey(address), Date.now().toString());
      setStatus("success");
      forceUpdate(n => n + 1);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Transaction failed");
      setStatus("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Faucet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Get 1,000 WzkLTC every 48 hours to test the protocol.</p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">Connect your wallet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Connect to claim 1,000 WzkLTC for testing.
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
          Get 1,000 WzkLTC every 48 hours to test the protocol.
        </p>
      </div>

      {/* Main claim card */}
      <Card className="p-8 flex flex-col items-center text-center gap-6">
        {/* Token icon + amount */}
        <div className="flex flex-col items-center gap-3">
          <TokenIcon symbol="WzkLTC" className="h-16 w-16" />
          <div>
            <p className="font-display text-4xl font-semibold tracking-tight">1,000</p>
            <p className="text-sm text-muted-foreground mt-1">WzkLTC per claim</p>
          </div>
        </div>

        {/* Cooldown indicator */}
        {timeLeft > 0 ? (
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/20 px-4 py-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Next claim in <span className="font-medium text-foreground">{formatTimeLeft(timeLeft)}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <Droplets className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-300 font-medium">Ready to claim</span>
          </div>
        )}

        {/* Status messages */}
        {status === "pending" && (
          <div className="flex items-center gap-2 w-full rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Minting WzkLTC to your wallet…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-start gap-2 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="text-left">
              <p className="text-[11px] font-medium text-emerald-300">1,000 WzkLTC sent to your wallet!</p>
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
            <p className="text-[11px] text-red-300">{error || "Transaction failed. Try again."}</p>
          </div>
        )}

        <PrimaryButton
          disabled={!canClaim || busy}
          onClick={handleClaim}
          className="px-16"
        >
          {busy ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Claiming…</>
          ) : timeLeft > 0 ? (
            `Available in ${formatTimeLeft(timeLeft)}`
          ) : (
            "Claim 1,000 WzkLTC"
          )}
        </PrimaryButton>
      </Card>

      {/* Info */}
      <div>
        <SectionLabel>Your Balances</SectionLabel>
        <Card className="p-5">
          <Row label="WzkLTC Balance" value={`${wzkLTCBalance} WzkLTC`} hint="Used as collateral in Troves" />
          <Row label="Cooldown"       value="48 hours"                  hint="Per wallet address" />
          <Row label="Amount"         value="1,000 WzkLTC per claim" />
          <Row label="Network"        value="LitVM LiteForge (testnet)" />
        </Card>
      </div>
    </div>
  );
};

export default Faucet;
