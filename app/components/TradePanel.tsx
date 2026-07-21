"use client";
import { useState } from "react";

type Tab = "Buy" | "Sell" | "Loan";

interface Props {
  ticker: string;
  price: number;
}

export default function TradePanel({ ticker, price }: Props) {
  const [tab, setTab] = useState<Tab>("Buy");
  const [spend, setSpend] = useState("");

  const receive = spend ? (parseFloat(spend) / price).toFixed(6) : "";
  const loanAmount = spend ? (parseFloat(spend) * 0.7).toFixed(2) : "";

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 sticky top-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1a1a1a] mb-5">
        {(["Buy", "Sell", "Loan"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 px-3 text-sm font-medium transition-colors border-b-2 -mb-px
              ${tab === t ? "text-white border-white" : "text-[#555] border-transparent hover:text-[#888]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Spend */}
      <label className="block text-xs text-[#555] mb-1.5">
        {tab === "Loan" ? "Collateral (FnUSD)" : "Spend"}
      </label>
      <div className="flex items-center bg-[#111] border border-[#1f1f1f] rounded-lg px-3 py-2.5 mb-4">
        <input
          type="number"
          placeholder="0"
          value={spend}
          onChange={(e) => setSpend(e.target.value)}
          className="flex-1 bg-transparent text-white text-sm focus:outline-none"
        />
        <span className="text-xs text-[#555] font-medium">FnUSD</span>
      </div>

      <div className="flex justify-center text-[#444] text-lg mb-4">↓</div>

      {/* Receive / Borrow */}
      {tab !== "Loan" ? (
        <>
          <label className="block text-xs text-[#555] mb-1.5">Receive at least</label>
          <div className="flex items-center bg-[#111] border border-[#1f1f1f] rounded-lg px-3 py-2.5 mb-5">
            <span className="flex-1 text-sm text-white">{receive || "0"}</span>
            <span className="text-xs text-[#555] font-medium">{ticker}</span>
          </div>
        </>
      ) : (
        <>
          <label className="block text-xs text-[#555] mb-1.5">Borrow amount (70% LTV)</label>
          <div className="flex items-center bg-[#111] border border-[#1f1f1f] rounded-lg px-3 py-2.5 mb-5">
            <span className="flex-1 text-sm text-white">{loanAmount || "0"}</span>
            <span className="text-xs text-[#555] font-medium">FnUSD</span>
          </div>
        </>
      )}

      {/* CTA */}
      <button className="w-full bg-white text-black text-sm font-semibold py-3 rounded-xl hover:bg-neutral-100 transition-colors">
        Connect Wallet
      </button>

      {/* Note */}
      {tab === "Loan" && (
        <p className="text-[10px] text-[#444] mt-3 leading-relaxed">
          Loans are over-collateralized. Minimum collateral ratio is 150%. Liquidation occurs if your position falls below the MCR.
        </p>
      )}
      {tab !== "Loan" && (
        <p className="text-[10px] text-[#444] mt-3 leading-relaxed">
          Tokenized assets on FENUS are settled on LitVM. Mock data only — connect wallet to trade.
        </p>
      )}
    </div>
  );
}
