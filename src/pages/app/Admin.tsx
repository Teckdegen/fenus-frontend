import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { formatEther, formatUnits, createPublicClient, http } from "viem";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, PrimaryButton, SectionLabel } from "@/components/app/Shared";
import { CONTRACTS } from "@/lib/contracts";
import { DIA_ADAPTER } from "@/lib/oracles";

const ADMIN_WALLET = "0xdb4034fA3829B488eFc1FC0f01F5F1Af722562Df".toLowerCase();
const RPC          = "https://liteforge.rpc.caldera.xyz/http";
const EXPLORER     = "https://liteforge.explorer.caldera.xyz/tx/";
const MCR          = 130;

const CHAIN = {
  id: 4441,
  name: "LitVM LiteForge",
  nativeCurrency: { name: "zkLitecoin", symbol: "zkLTC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
} as const;

const pub = createPublicClient({ chain: CHAIN, transport: http(RPC) });

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const TROVE_MANAGER_ABI = [
  { name: "liquidate", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "owner", type: "address" }], outputs: [] },
  { name: "batchLiquidate", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "owners", type: "address[]" }], outputs: [] },
  { name: "getTroveOwnersCount", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }] },
  { name: "getTroveColl", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "getTroveDebt", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "getTroveStatus", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint8" }] },
] as const;

const TROVE_NFT_ABI = [
  { name: "ownerOf", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
] as const;

const DIA_ABI = [
  { name: "latestRoundData", type: "function", stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId",         type: "uint80"  },
      { name: "answer",          type: "int256"  },
      { name: "startedAt",       type: "uint256" },
      { name: "updatedAt",       type: "uint256" },
      { name: "answeredInRound", type: "uint80"  },
    ] },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Trove = {
  tokenId: number;
  owner: string;
  debt: number;
  coll: number;
  collUSD: number;
  ratio: number | null;
  liquidatable: boolean;
};

const shorten = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`;

// ─── Component ────────────────────────────────────────────────────────────────

const Admin = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();

  const [troves,  setTroves]  = useState<Trove[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash,  setTxHash]  = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_WALLET;

  // Redirect non-admin
  useEffect(() => {
    if (isConnected && !isAdmin) navigate("/app");
  }, [isConnected, isAdmin, navigate]);

  // Get price from DIA
  const { data: diaData } = useReadContract({
    address: DIA_ADAPTER,
    abi: DIA_ABI,
    functionName: "latestRoundData",
    query: { refetchInterval: 30_000 },
  });

  const price = diaData ? parseFloat(formatUnits(diaData[1] as bigint, 18)) : 0;

  // Scan troves using viem readContract (handles ABI encoding correctly)
  const scanTroves = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setTxHash(null);
    setTxError(null);

    const currentPrice = price;
    const found: Trove[] = [];

    for (let id = 1; id <= 100; id++) {
      try {
        // ownerOf(tokenId) — will throw if token doesn't exist
        const owner = await pub.readContract({
          address: CONTRACTS.TroveNFT as `0x${string}`,
          abi: TROVE_NFT_ABI,
          functionName: "ownerOf",
          args: [BigInt(id)],
        }) as string;

        if (!owner || owner === "0x0000000000000000000000000000000000000000") continue;

        // getTroveStatus
        const status = await pub.readContract({
          address: CONTRACTS.TroveManager as `0x${string}`,
          abi: TROVE_MANAGER_ABI,
          functionName: "getTroveStatus",
          args: [owner as `0x${string}`],
        }) as number;

        if (Number(status) !== 1) continue; // only Active

        // getTroveColl and getTroveDebt
        const [coll18, debt18] = await Promise.all([
          pub.readContract({
            address: CONTRACTS.TroveManager as `0x${string}`,
            abi: TROVE_MANAGER_ABI,
            functionName: "getTroveColl",
            args: [owner as `0x${string}`],
          }) as Promise<bigint>,
          pub.readContract({
            address: CONTRACTS.TroveManager as `0x${string}`,
            abi: TROVE_MANAGER_ABI,
            functionName: "getTroveDebt",
            args: [owner as `0x${string}`],
          }) as Promise<bigint>,
        ]);

        const coll = parseFloat(formatEther(coll18));
        const debt = parseFloat(formatEther(debt18));

        if (debt === 0) continue;

        const collUSD = coll * currentPrice;
        const ratio   = debt > 0 ? (collUSD / debt) * 100 : null;

        found.push({
          tokenId: id,
          owner,
          debt,
          coll,
          collUSD,
          ratio,
          liquidatable: ratio !== null && ratio < MCR,
        });
      } catch {
        // token doesn't exist or reverted, skip
      }
    }

    setTroves(found);
    setLoading(false);
  }, [isAdmin, price]);

  // Auto-scan on mount and when price loads
  useEffect(() => {
    if (isAdmin && price > 0) {
      scanTroves();
    }
  }, [isAdmin, price]);

  // ─── Actions ──────────────────────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────────

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
  const totalDebt    = troves.reduce((s, t) => s + t.debt, 0);
  const totalCollUSD = troves.reduce((s, t) => s + t.collUSD, 0);

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
        <PrimaryButton onClick={scanTroves} disabled={loading} className="flex items-center gap-2 text-xs px-4 py-2">
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Scanning…</>
            : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh</>
          }
        </PrimaryButton>
      </div>

      {/* Stats strip */}
      <Card className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Active Troves</p>
          <p className="font-display text-2xl font-semibold mt-0.5">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /> : troves.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">wzkLTC Price</p>
          <p className="font-display text-2xl font-semibold mt-0.5">${price > 0 ? price.toFixed(2) : "..."}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Liquidatable</p>
          <p className={`font-display text-2xl font-semibold mt-0.5 ${liquidatable.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {loading ? "..." : liquidatable.length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Total Debt</p>
          <p className="font-display text-2xl font-semibold mt-0.5">
            {loading ? "..." : `${totalDebt.toFixed(0)} FnUSD`}
          </p>
        </div>
      </Card>

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
      {!loading && liquidatable.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300 font-medium">
              {liquidatable.length} trove{liquidatable.length > 1 ? "s" : ""} below 130% CR
            </p>
          </div>
          <button onClick={batchLiquidate}
            className="shrink-0 rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600 transition ml-4">
            Liquidate All
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="p-10 flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Scanning tokenIds 1 to 100 for active troves…</p>
        </Card>
      )}

      {/* Troves table */}
      {!loading && troves.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No active troves found. Click Refresh to scan again.
        </Card>
      )}

      {!loading && troves.length > 0 && (
        <div>
          <SectionLabel>All Active Troves ({troves.length})</SectionLabel>
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
                  {[...troves]
                    .sort((a, b) => (a.ratio ?? 999) - (b.ratio ?? 999))
                    .map((t) => {
                      const isRed   = t.ratio !== null && t.ratio < MCR;
                      const isAmber = t.ratio !== null && t.ratio >= MCR && t.ratio < 145;
                      return (
                        <tr key={t.tokenId} className="border-b border-border/20 last:border-0 hover:bg-foreground/[0.02]">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{t.tokenId}</td>
                          <td className="px-4 py-3 font-mono text-xs">{shorten(t.owner)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{t.debt.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{t.coll.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            ${t.collUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
