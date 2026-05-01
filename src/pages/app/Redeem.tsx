import { useState } from "react";
import { ArrowDown, Info, CheckCircle2, Loader2, AlertTriangle, Wallet } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useWriteContract } from "wagmi";
import { parseUnits, maxUint256, createPublicClient, http } from "viem";
import {
  Card, PrimaryButton, Row, SectionLabel, TokenInput, TokenIcon,
} from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";
import { CONTRACTS } from "@/lib/contracts";

const REDEMPTION_FEE_FLOOR = 0.005;
const EXPLORER             = "https://liteforge.explorer.caldera.xyz/tx/";
const RPC                  = "https://liteforge.rpc.caldera.xyz/http";

const REDEMPTION_HELPER_ABI = [
  { name: "redeem", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "fnUSDAmount6",  type: "uint256" },
      { name: "firstHint",     type: "address" },
      { name: "maxIterations", type: "uint256" },
    ], outputs: [{ name: "collateralOut", type: "uint256" }] },
] as const;

const FNUSD_ABI = [
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
] as const;

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const RH   = CONTRACTS.RedemptionHelper as `0x${string}`;
const FNUSD_ADDR = CONTRACTS.FnUSD as `0x${string}`;

const Redeem = () => {
  const { open } = useAppKit();
  const { fnUSDBalance: fnUSDBalanceFull, wzkLTCBalance: wzkLTCBalanceFull, priceNum, isConnected, address } = useBalances();
  const { writeContractAsync } = useWriteContract();

  const [fnUSDAmount, setFnUSDAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "approving" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [error,  setError]  = useState("");

  const parsed = parseFloat(fnUSDAmount) || 0;
  const price  = priceNum;

  const collateralGross = price > 0 ? parsed / price : 0;
  const fee             = collateralGross * REDEMPTION_FEE_FLOOR;
  const collateralOut   = collateralGross - fee;
  const feeUSD          = parsed * REDEMPTION_FEE_FLOOR;
  const hasAmount       = parsed > 0;
  const busy            = status === "approving" || status === "pending";

  const collOutDisplay = hasAmount && price > 0
    ? collateralOut.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "0.000000";

  const feeDisplay = price > 0
    ? `${fee.toLocaleString(undefined, { maximumFractionDigits: 6 })} zkLTC ≈ $${feeUSD.toFixed(2)}`
    : "0.000000 zkLTC";

  const priceDisplay = price > 0 ? `$${price.toFixed(4)}` : "Awaiting connection";

  const handleRedeem = async () => {
    if (!hasAmount || !address) return;
    setStatus("approving");
    setError("");
    try {
      const pub = createPublicClient({ transport: http(RPC) });
      const fnUSDAmt = parseUnits(fnUSDAmount, 6);

      // Check FnUSD allowance for RedemptionHelper
      const allowance = await pub.readContract({
        address: FNUSD_ADDR, abi: FNUSD_ABI,
        functionName: "allowance", args: [address as `0x${string}`, RH],
      }) as bigint;

      if (allowance < fnUSDAmt) {
        const approveHash = await writeContractAsync({
          address: FNUSD_ADDR, abi: FNUSD_ABI,
          functionName: "approve", args: [RH, maxUint256],
        });
        await pub.waitForTransactionReceipt({ hash: approveHash });
      }

      setStatus("pending");
      const hash = await writeContractAsync({
        address: RH,
        abi: REDEMPTION_HELPER_ABI,
        functionName: "redeem",
        args: [fnUSDAmt, ZERO, BigInt(0)],
      });
      setTxHash(hash);
      await pub.waitForTransactionReceipt({ hash });
      setStatus("success");
      setFnUSDAmount("");
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Transaction failed");
      setStatus("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Redeem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Burn FnUSD and receive zkLTC at the current oracle price.
          </p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">Connect your wallet</p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Connect to redeem FnUSD for zkLTC.
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Redeem</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Burn FnUSD and receive zkLTC at the current oracle price, minus a small redemption fee.
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <TokenInput
          label="You burn"
          symbol="FnUSD"
          balance={fnUSDBalanceFull}
          value={fnUSDAmount}
          onChange={(v) => { setFnUSDAmount(v); setStatus("idle"); }}
        />

        <div className="flex justify-center py-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/80">
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </span>
        </div>

        {/* zkLTC output */}
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">You receive</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              Balance: {wzkLTCBalanceFull}
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

        {/* Tx status */}
        {status === "approving" && (
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Approving FnUSD spend…</p>
          </div>
        )}
        {status === "pending" && (
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/20 px-4 py-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Waiting for confirmation…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-emerald-300">Redemption confirmed!</p>
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
          <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
            <p className="text-[11px] text-red-300">{error || "Transaction failed. Try again."}</p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <PrimaryButton disabled={!hasAmount || busy} onClick={handleRedeem}>
            {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Working…</> : "Redeem FnUSD"}
          </PrimaryButton>
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
