import { PORTFOLIO_HOLDINGS, TRANSACTIONS, TOTAL_PORTFOLIO_VALUE } from "@/lib/mock-data";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioDonut from "@/components/PortfolioDonut";
import Link from "next/link";

const TX_TYPE_COLORS: Record<string, string> = {
  Buy: "text-green-400",
  Sell: "text-red-400",
  Loan: "text-blue-400",
};

export default function PortfolioPage() {
  return (
    <div className="px-6 py-8 max-w-[900px]">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-[#555]">Welcome, 0xdb40...62Df</div>
        <div className="text-xs text-[#444] mt-0.5">July 9, 2026 · 03:32 AM GMT</div>
      </div>

      {/* Portfolio chart */}
      <PortfolioChart />

      {/* Holdings */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">My Holdings</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555]">Asset Class ↓</span>
            <input
              placeholder="Search asset"
              className="bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-white rounded-lg px-3 py-1.5 placeholder:text-[#444] focus:outline-none w-32"
            />
          </div>
        </div>

        {/* Balance cards */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3">
            <div className="text-[10px] text-[#555] mb-1">FnUSD Balance</div>
            <div className="text-sm font-semibold text-white">$0</div>
          </div>
          <div className="flex-1 bg-[#0a0a0a] border border-green-900/40 rounded-lg px-4 py-3">
            <div className="text-[10px] text-[#555] mb-1">Total Value</div>
            <div className="text-sm font-semibold text-white">
              ${TOTAL_PORTFOLIO_VALUE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Holdings table */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2.5 border-b border-[#1a1a1a] text-[10px] text-[#444] font-medium">
            <span>Token</span>
            <span>Asset Class</span>
            <span>Price ($)</span>
            <span>Balance</span>
            <span className="text-right">Value ($)</span>
          </div>
          {PORTFOLIO_HOLDINGS.map((h) => (
            <Link
              key={h.ticker}
              href={`/assets/${h.ticker}`}
              className="grid grid-cols-5 px-4 py-3 border-b border-[#111] hover:bg-[#111] transition-colors items-center"
            >
              <div className="flex items-center gap-2">
                <img src={h.logoUrl} alt={h.ticker} width={20} height={20} className="rounded-full bg-[#1a1a1a]" />
                <div>
                  <div className="text-xs text-white font-medium">{h.ticker}</div>
                  <div className="text-[10px] text-[#444]">{h.name}</div>
                </div>
              </div>
              <span className="text-[11px] text-blue-400">Stock</span>
              <span className="text-xs text-white">${h.price.toFixed(2)}</span>
              <span className="text-xs text-white">{h.balance.toFixed(4)}</span>
              <span className="text-xs text-white text-right">${h.value.toFixed(2)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Portfolio Allocation */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white mb-3">Portfolio Allocation</h2>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <PortfolioDonut />
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="mt-6 mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555]">Type ↓</span>
            <input
              placeholder="Search"
              className="bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-white rounded-lg px-3 py-1.5 placeholder:text-[#444] focus:outline-none w-28"
            />
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-2.5 border-b border-[#1a1a1a] text-[10px] text-[#444] font-medium">
            <span className="col-span-2">Date and Time</span>
            <span>Type</span>
            <span>Amount</span>
            <span className="text-right">Status</span>
          </div>
          {TRANSACTIONS.map((tx, i) => (
            <div
              key={i}
              className="grid grid-cols-5 px-4 py-3 border-b border-[#111] items-center"
            >
              <div className="col-span-2">
                <div className="text-xs text-white">{tx.date}</div>
                <div className="text-[10px] text-[#444]">{tx.time}</div>
              </div>
              <span className={`text-xs font-medium ${TX_TYPE_COLORS[tx.type] ?? "text-white"}`}>
                {tx.type}
              </span>
              <div>
                <div className="text-xs text-white">{tx.ticker}</div>
                <div className="text-[10px] text-[#444]">{tx.amount} · {tx.value}</div>
              </div>
              <span className={`text-[11px] text-right font-medium
                ${tx.status === "Completed" ? "text-green-400" : "text-yellow-400"}`}>
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
