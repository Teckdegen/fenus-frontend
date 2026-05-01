import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, X } from "lucide-react";

const EXPLORER = "https://liteforge.explorer.caldera.xyz/tx/";

export interface TxSuccessData {
  type: string;        // e.g. "Open Trove", "Add Collateral"
  amount?: string;     // e.g. "500.00 FnUSD"
  amount2?: string;    // e.g. "10.00 WzkLTC" (for two-sided ops)
  txHash: string;
}

interface Props {
  data: TxSuccessData | null;
  onClose: () => void;
}

export const TxSuccessModal = ({ data, onClose }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setVisible(true);
    }
  }, [data]);

  if (!data || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Success icon — animated */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground/10 ring-4 ring-foreground/20">
          <CheckCircle2 className="h-10 w-10 text-foreground" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <p className="font-display text-xl font-semibold tracking-tight">
            Transaction Confirmed
          </p>
          <p className="text-sm text-muted-foreground">{data.type}</p>
        </div>

        {/* Amount(s) */}
        {(data.amount || data.amount2) && (
          <div className="w-full rounded-2xl border border-border/60 bg-background/40 px-5 py-4 space-y-2">
            {data.amount && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Amount</span>
                <span className="font-display text-base font-semibold tabular-nums">
                  {data.amount}
                </span>
              </div>
            )}
            {data.amount2 && (
              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-[11px] text-muted-foreground">Collateral</span>
                <span className="font-display text-base font-semibold tabular-nums">
                  {data.amount2}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Explorer link */}
        <a
          href={`${EXPLORER}${data.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-5 py-3.5 transition hover:border-foreground/40 hover:bg-foreground/5"
        >
          <div className="text-left">
            <p className="text-[11px] text-muted-foreground">Transaction</p>
            <p className="font-mono text-xs text-foreground mt-0.5">
              {data.txHash.slice(0, 10)}…{data.txHash.slice(-8)}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </a>

        {/* Dismiss */}
        <button
          onClick={handleClose}
          className="w-full rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:opacity-90 active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    </div>
  );
};
