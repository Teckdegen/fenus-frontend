import { useState } from "react";
import { ArrowDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Card, PrimaryButton, SectionLabel, Row, TokenIcon } from "@/components/app/Shared";
import { CONTRACTS } from "@/lib/contracts";

const WZKLITECOIN_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "wrap", type: "function", stateMutability: "payable",
    inputs: [], outputs: [] },
] as const;

const Convert = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount]   = useState("");
  const [status, setStatus]   = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash]   = useState("");

  // Native zkLTC balance (gas token)
  const { data: nativeBal } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  // WzkLTC balance
  const { data: wzkLTCBal, refetch: refetchWzkLTC } = useReadContract({
    address: CONTRACTS.WzkLTC as `0x${string}`,
    abi: WZKLITECOIN_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const nativeNum  = nativeBal ? parseFloat(formatUnits(nativeBal.value, 18)) : 0;
  const wzkLTCNum  = wzkLTCBal ? parseFloat(formatUnits(wzkLTCBal, 8)) : 0;
  const parsedAmt  = parseFloat(amount) || 0;
  const hasBalance = nativeNum > 0;
  const canWrap    = parsedAmt > 0 && parsedAmt <= nativeNum && isConnected;

  const nativeFmt  = nativeNum.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const wzkLTCFmt  = wzkLTCNum.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const handleMax = () => {
    // Leave a small amount for gas
    const max = Math.max(nativeNum - 0.001, 0);
    setAmount(max.toFixed(6));
  };

  const handleWrap = async () => {
    if (!canWrap || !address) return;
    setStatus("pending");
    try {
      // Dynamic import to avoid SSR issues
      const { createWalletClient, custom, parseEther } = await import("viem");
      const { litVMLiteForge } = await import("@/lib/web3");

      const walletClient = createWalletClient({
        chain: litVMLiteForge as any,
        transport: custom((window as any).ethereum),
      });

      const hash = await walletClient.sendTransaction({
        account: address as `0x${string}`,
        to: CONTRACTS.WzkLTC as `0x${string}`,
        value: parseEther(amount),
        data: "0xd0e30db0", // wrap() function selector
      });

      setTxHash(hash);
      setStatus("success");
      setAmount("");
      setTimeout(() => refetchWzkLTC(), 3000);
    } catch (e: any) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Convert</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wrap native zkLTC into WzkLTC to use as collateral in your Trove.
        </p>
      </div>

      {/* Low balance notification */}
      {isConnected && !hasBalance && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-orange-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-300">No zkLTC to wrap</p>
            <p className="text-[11px] text-orange-300/70 mt-0.5">
              Your native zkLTC balance is 0. You need native zkLTC to wrap into WzkLTC.
              Get zkLTC from a faucet or bridge first.
            </p>
          </div>
        </div>
      )}

      {/* Wrap card */}
      <Card className="p-5 space-y-3">

        {/* zkLTC input */}
        <div className="rounded-2xl border border-border bg-background/40 p-4 transition focus-within:border-foreground/40">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">You send</span>
            <button
              type="button"
              onClick={handleMax}
              className="font-mono text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              Balance: {isConnected ? nativeFmt : "—"} zkLTC
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStatus("idle"); }}
              className="w-full bg-transparent font-display text-3xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/30"
            />
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
              <TokenIcon symbol="zkLTC" className="h-5 w-5" />
              <span className="font-display text-xs font-medium tracking-wide">zkLTC</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </div>

        {/* WzkLTC output — read only */}
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">You receive</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Balance: {isConnected ? wzkLTCFmt : "—"} WzkLTC
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-full font-display text-3xl font-semibold tabular-nums text-foreground/80">
              {parsedAmt > 0 ? parsedAmt.toFixed(6) : "0.000000"}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
              <TokenIcon symbol="WzkLTC" className="h-5 w-5" />
              <span className="font-display text-xs font-medium tracking-wide">WzkLTC</span>
            </div>
          </div>
        </div>

        {/* Rate info */}
        <div className="rounded-2xl border border-border/60 bg-background/20 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Rate</span>
            <span className="tabular-nums text-muted-foreground">1 zkLTC = 1 WzkLTC</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Fee</span>
            <span className="tabular-nums text-muted-foreground">None — only gas</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Reversible</span>
            <span className="tabular-nums text-muted-foreground">Yes — unwrap anytime</span>
          </div>
        </div>

        {/* Status messages */}
        {status === "pending" && (
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-foreground/40 border-t-foreground animate-spin" />
            <p className="text-[11px] text-muted-foreground">Waiting for wallet confirmation…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-emerald-300">Wrap successful!</p>
              {txHash && (
                <a
                  href={`https://liteforge.explorer.caldera.xyz/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400/70 hover:text-emerald-400 underline"
                >
                  View on explorer
                </a>
              )}
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <p className="text-[11px] text-red-300">Transaction failed or rejected. Try again.</p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <PrimaryButton
            disabled={!canWrap || status === "pending"}
            onClick={handleWrap}
          >
            {status === "pending" ? "Wrapping…" : "Wrap zkLTC"}
          </PrimaryButton>
        </div>
      </Card>

      {/* Info */}
      <div>
        <SectionLabel>Why wrap?</SectionLabel>
        <Card className="p-5">
          <Row label="What is WzkLTC"   value="ERC-20 version of zkLTC"    hint="Used as collateral in FENUS Troves" />
          <Row label="Backing"          value="1:1 with native zkLTC"       hint="Fully redeemable at any time" />
          <Row label="To unwrap"        value="Go to Trove → Close"         hint="Or call unwrap() directly on the contract" />
          <Row label="Contract"         value={`${CONTRACTS.WzkLTC.slice(0,10)}…`} hint="WzkLTC on LitVM LiteForge" />
        </Card>
      </div>
    </div>
  );
};

export default Convert;
