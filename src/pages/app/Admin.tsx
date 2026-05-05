import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, PrimaryButton, SectionLabel } from "@/components/app/Shared";
import { CONTRACTS } from "@/lib/contracts";

const ADMIN_WALLET = "0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df".toLowerCase();
const RPC          = "https://liteforge.rpc.caldera.xyz/http";
const EXPLORER     = "https://liteforge.explorer.caldera.xyz/tx/";
const MCR          = 130; // liquidation threshold %

const TROVE_MANAGER_ABI = [
  { name: "liquidate", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "owner", type: "address" }], outputs: [] },
  { name: "batchLiquidate", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "owners", type: "address[]" }], outputs: [] },
] as const;

type Trove = {
  tokenId: number;
  owner: string;
  debt: bigint;
  coll: bigint;
  ratio: number | null;
  liquidatable: boolean;
};

const shorten = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`;

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return res.json();
}

async function ethCall(to: string, data: string) {
  const r = await rpc("eth_call", [{ to, data }, "latest"]);
  return r.result as string | undefined;
}

function pad(n: number) { return n.toString(16).padStart(64, "0"); }

const Admin = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();

  const [troves,   setTroves]   = useState<Trove[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [price,    setPrice]    = useState<number>(0);
  const [txHash,   setTxHash]   = useState<string | null>(null);
  const [txError,  setTxError]  = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET;

  // Redirect non-admin
  useEffect(() => {
    if (isConnected && !isAdmin) navigate("/app");
  }, [isConnected, isAdmin, navigate]);

  const fetchPrice = async () => {
    // getLastGoodPrice() selector = 0x9a8a0592
    const result = await ethCall(CONTRACTS.PriceFeed, "0x9a8a0592");
    if (result && result !== "0x") {
      const p = parseFloat(formatEther(BigInt(result)));
      setPrice(p);
      return p;
    }
    return 0;
  };

  const scanTroves = async () => {
    setLoading(true);
    setScanning(true);
    setTxHash(null);
    setTxError(null);

    const currentPrice = await fetchPrice();
    const found: Trove[] = [];

    for (let id = 1; id <= 100; id++) {
      try {
        // ownerOf(uint256) = 0x6352211e
        const ownerResult = await ethCall(CONTRACTS.TroveNFT, `0x6352211e${pad(id)}`);
        if (!ownerResult || ownerResult === "0x" || ownerResult.length < 66) continue;
        const owner = `0x${ownerResult.slice(-40)}`;
        if (owner === "0x0000000000000000000000000000000000000000") continue;

        // troves(uint256) = 0x1e6d4b4b
        const troveResult = await ethCall(CONTRACTS.TroveManager, `0x1e6d4b4b${pad(id)}`);
        if (!troveResult || troveResult === "0x" || troveResult.length < 130) continue;

        const hex    = troveResult.slice(2);
        const debt   = BigInt(`0x${hex.slice(0, 64)}`);
        const coll   = BigInt(`0x${hex.slice(64, 128)}`);
        const status = parseInt(hex.slice(320, 384), 16);

        if (status !== 1 || debt === 0n) continue;

        const debtNum  = parseFloat(formatEther(debt));
        const collNum  = parseFloat(formatEther(coll));
        const collUSD  = collNum * currentPrice;
        const ratio    = debtNum > 0 ? (collUSD / debtNum) * 100 : null;

        found.push({
          tokenId: id,
          owner,
          debt,
          coll,
          ratio,
          liquidatable: ratio !== null && ratio < MCR,
        });
      } catch {
        // skip
      }
    }

    setTroves(found);
    setLoading(false);
    setScanning(false);
  };

  const liquidate = async (owner: string) => {
    setTxHash(null);
    setTxError(null);
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.TroveManager as `0x${string}`,
        abi: TROVE_MANAGER_ABI,
        functionName: "liquidate",
        args: [owner as `0x${string}`],
      });
      setTxHash(hash);
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  const batchLiquidate = async () => {
    const targets = troves.filter(t => t.liquidatable).map(t => t.owner as `0x${string}`);
    if (targets.length === 0) return;
    setTxHash(null);
    setTxError(null);
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.TroveManager as `0x${string}`,
        abi: TROVE_MANAGER_ABI,
        functionName: "batchLiquidate",
        args: [targets],
      });
      setTxHash(hash);
    } catch (e: unknown) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl pt-10">
        <Card className="p-10 flex flex-col items-center text-center gap-3">
          <Shield className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Connect your admin wallet to access this page.</p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) return null;

  const liquidatable = troves.filter(t => t.liquidatable);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20">
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Trove management and liquidations</p>
          </div>
        </div>
        <PrimaryButton onClick={scanTroves} disabled={loading} className="flex items-center gap-2">
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Scanning…</>
            : <><RefreshCw className="h-3.5 w-3.5" />Scan Troves</>
          }
        </PrimaryButton>
      </div>

      {/* Stats strip */}
      {troves.length > 0 && (
        <Card className="p-4 flex items-center justify-around gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Active Troves</p>
            <p className="font-display text-2xl font-semibold mt-0.5">{troves.length}</p>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">wzkLTC Price</p>
            <p className="font-display text-2xl font-semibold mt-0.5">${price.toFixed(2)}</p>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Liquidatable</p>
            <p className={`font-display text-2xl font-semibold mt-0.5 ${liquidatable.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {liquidatable.length}
            </p>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Total Debt</p>
            <p className="font-display text-2xl font-semibold mt-0.5">
              {troves.reduce((s, t) => s + parseFloat(formatEther(t.debt)), 0).toFixed(0)} FnUSD
            </p>
          </div>
        </Card>
      )}

      {/* Tx feedback */}
      {txHash && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-[11px] font-medium text-emerald-300">Transaction submitted</p>
            <a href={`${EXPLORER}${txHash}`} target="_blank" rel="noreferrer"
              className="text-[10px] text-emerald-400/70 hover:text-emerald-400 underline font-mono">
              {txHash.slice(0, 20)}...
            </a>
          </div>
        </div>
      )}
      {txError && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
          <p className="text-[11px] text-red-300">{txError}</p>
        </div>
      )}

      {/* Liquidatable alert */}
      {liquidatable.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 font-medium">
              {liquidatable.length} trove{liquidatable.length > 1 ? "s" : ""} below 130% CR and eligible for liquidation
            </p>
          </div>
          <button
            onClick={batchLiquidate}
            className="shrink-0 rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600 transition ml-4"
          >
            Liquidate All
          </button>
        </div>
      )}

      {/* Troves table */}
      {troves.length === 0 && !loading && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {scanning ? "Scanning..." : "Click Scan Troves to load all active positions."}
        </Card>
      )}

      {troves.length > 0 && (
        <div>
          <SectionLabel>All Active Troves</SectionLabel>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-right">Debt (FnUSD)</th>
                    <th className="px-4 py-3 text-right">Coll (wzkLTC)</th>
                    <th className="px-4 py-3 text-right">Coll Value</th>
                    <th className="px-4 py-3 text-right">Ratio</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {troves
                    .sort((a, b) => (a.ratio ?? 999) - (b.ratio ?? 999))
                    .map((t) => {
                      const debt    = parseFloat(formatEther(t.debt));
                      const coll    = parseFloat(formatEther(t.coll));
                      const collUSD = coll * price;
                      const isRed   = t.ratio !== null && t.ratio < MCR;
                      const isAmber = t.ratio !== null && t.ratio >= MCR && t.ratio < 145;

                      return (
                        <tr key={t.tokenId} className="border-b border-border/20 last:border-0 hover:bg-foreground/[0.02]">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{t.tokenId}</td>
                          <td className="px-4 py-3 font-mono text-xs">{shorten(t.owner)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{debt.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{coll.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            ${collUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums font-semibold ${
                            isRed ? "text-red-400" : isAmber ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {t.ratio !== null ? `${t.ratio.toFixed(1)}%` : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => liquidate(t.owner)}
                              disabled={!t.liquidatable}
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                                t.liquidatable
                                  ? "border-red-500/50 text-red-400 hover:bg-red-500/10 cursor-pointer"
                                  : "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                              }`}
                            >
                              {t.liquidatable ? "Liquidate" : "Safe"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
