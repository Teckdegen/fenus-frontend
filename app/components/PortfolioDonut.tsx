"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PORTFOLIO_HOLDINGS, TOTAL_PORTFOLIO_VALUE } from "@/lib/mock-data";

const COLORS = ["#ffffff", "#666666", "#333333", "#aaaaaa"];

export default function PortfolioDonut() {
  const data = PORTFOLIO_HOLDINGS.map((h) => ({
    name: h.ticker,
    value: Math.round(h.pct * 10) / 10,
    amount: h.value,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              strokeWidth={0}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [`${Number(v)}%`, String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-[#555]">All</span>
          <span className="text-sm font-semibold text-white">100%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1">
        <div className="text-xs text-[#555] mb-1">All Assets — Total Value</div>
        <div className="text-2xl font-bold text-white mb-3">
          ${TOTAL_PORTFOLIO_VALUE.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex flex-col gap-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-[#888]">{d.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#555] text-xs">{d.value}%</span>
                <span className="text-white text-xs font-medium">
                  ${d.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
