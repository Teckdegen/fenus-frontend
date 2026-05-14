import { useState } from "react";
import { AlertTriangle, Info, Loader2, Wallet, ArrowRight } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { Card, GhostButton, PrimaryButton } from "@/components/app/Shared";
import { useBalances } from "@/hooks/useBalances";
import { useTroveNFT } from "@/hooks/useTroveNFT";
import { TxSuccessModal } from "@/components/app/TxSuccessModal";

const EXPLORER = "https://liteforge.explorer.caldera.xyz/tx/";

function TxStatus({ status, txHash, error }: { status: string; txHash: string; error: string }) {
  if (status === "idle") return null;
  if (status === "pending") return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black px-4 py-3">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
      <p className="text-[11px] text-white/60">Waiting for confirmation…</p>
    </div>
  );
  if (status === "success") return (
    <div className="flex items-start gap-2 rounded-2xl border border-white/30 bg-white/5 px-4 py-3">
      <div className="h-4 w-4 shrink-0 rounded-full bg-white flex items-center justify-center mt-0.5">
        <div className="h-2 w-2 bg-black rounded-full" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-white">Transaction confirmed!</p>
        {txHash && (
          <a href={`${EXPLORER}${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-white/70 hover:text-white underline">
            View on explorer
          </a>
        )}
      </div>
    </div>
  );
  if (status === "error") return (
    <div className="flex items-start gap-2 rounded-2xl border border-white/30 bg-white/5 px-4 py-3">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-white mt-0.5" />
      <p className="text-[11px] text-white/80">{error || "Transaction failed. Try again."}</p>
    </div>
  );
  return null;
}

const Transfer = () => {
  const [transferTo, setTransferTo] = useState("");
  const { open } = useAppKit();

  const {
    troveColl: existingCollStr,
    troveDebt: existingDebtStr,
    isConnected,
  } = useBalances();

  const nft = useTroveNFT();

  const existingColl = parseFloat(existingCollStr.replace(/,/g, "")) || 0;
  const existingDebt = parseFloat(existingDebtStr.replace(/,/g, "")) || 0;
  const busy = nft.status === "pending";

  // Connect prompt
  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Transfer Trove</h1>
          <p className="mt-1 text-sm text-white/60">Transfer your entire trove position to another wallet.</p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4 bg-black border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Wallet className="h-6 w-6 text-white/60" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-white">Connect your wallet</p>
            <p className="mt-1 text-sm text-white/60 max-w-xs">
              Connect to transfer your trove position to another wallet.
            </p>
          </div>
          <PrimaryButton onClick={() => open()}>Connect Wallet</PrimaryButton>
        </Card>
      </div>
    );
  }

  // No trove
  if (!nft.tokenId) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="px-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Transfer Trove</h1>
          <p className="mt-1 text-sm text-white/60">Transfer your entire trove position to another wallet.</p>
        </div>
        <Card className="p-10 flex flex-col items-center justify-center text-center gap-4 bg-black border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Info className="h-6 w-6 text-white/60" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-white">No Trove Found</p>
            <p className="mt-1 text-sm text-white/60 max-w-xs">
              You don't have an open trove. Open a trove first to transfer it.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="px-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Transfer Trove</h1>
        <p className="mt-1 text-sm text-white/60">Transfer your entire trove position to another wallet.</p>
      </div>

      <Card className="p-6 space-y-6 bg-black border-white/10">
        {/* Your Trove NFT */}
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Your Trove NFT</p>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/60">Token ID</span>
            <span className="tabular-nums font-medium text-white">#{nft.tokenId.toString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/60">Collateral</span>
            <span className="tabular-nums text-white">{existingColl.toFixed(4)} wzkLTC</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/60">Debt</span>
            <span className="tabular-nums text-white">{existingDebt.toFixed(2)} FnUSD</span>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-4">
          <p className="text-[11px] font-medium text-white/90 mb-1">Heads up</p>
          <p className="text-[10px] text-white/60 leading-relaxed">
            This transfers your entire position — {existingColl.toFixed(4)} wzkLTC collateral
            and {existingDebt.toFixed(2)} FnUSD debt — to the recipient. They take over everything,
            including any future obligations. Double-check the address.
          </p>
        </div>

        {/* Transfer Input */}
        <div className="space-y-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
              Recipient Address
            </span>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => { setTransferTo(e.target.value); nft.reset(); }}
              placeholder="0x..."
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </label>
          <p className="text-[10px] text-white/40 px-1">
            Enter the Ethereum address of the person you want to transfer your trove to.
          </p>
        </div>

        <TxStatus status={nft.status} txHash={nft.txHash} error={nft.error} />

        <div className="flex justify-end pt-2">
          <GhostButton 
            disabled={!transferTo || !nft.tokenId || busy}
            onClick={() => nft.transferTrove(transferTo)}
          >
            {busy ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Transferring…</>
            ) : (
              <><ArrowRight className="h-3.5 w-3.5 mr-2" />Transfer Trove</>
            )}
          </GhostButton>
        </div>
      </Card>

      {/* Full-screen success modal */}
      <TxSuccessModal
        data={nft.txResult}
        onClose={() => nft.reset()}
      />
    </div>
  );
};

export default Transfer;
