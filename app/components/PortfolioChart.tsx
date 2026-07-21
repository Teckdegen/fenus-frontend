"use client";
import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getChartData } from "@/lib/mock-data";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type Range = (typeof RANGES)[number];

export default function PortfolioChart() {
  const [range, setRange] = useState<Range>("1M");
  const data = getChartData(range, true).map((d) => ({
    ...d,
    price: Math.round(d.price * 38.5 * 100) / 100, // scale to portfolio value
  }));

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-white">
            $7,892.14
          </div>
          <div className="text-xs text-red-400 mt-0.5">▼ $21.01 (0.26%) · 24H</div>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors
                ${range === r ? "bg-white text-black" : "text-[#555] hover:text-white"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#111" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#444", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#666" }}
            itemStyle={{ color: "#fff" }}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, "Value"]}
          />
          <Area type="monotone" dataKey="price" stroke="#ef4444" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
