"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getChartData } from "@/lib/mock-data";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type Range = (typeof RANGES)[number];

interface Props {
  up: boolean;
  price: number;
  change: number;
  changePct: number;
}

export default function AssetChart({ up, price, change, changePct }: Props) {
  const [range, setRange] = useState<Range>("1D");
  const data = getChartData(range, up);
  const color = up ? "#22c55e" : "#ef4444";

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      {/* Price header */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white">${price.toFixed(2)}</div>
        <div className={`text-sm mt-1 ${up ? "text-green-400" : "text-red-400"}`}>
          {up ? "▲" : "▼"} ${Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%) · 24H
        </div>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 mb-4">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors
              ${range === r ? "bg-white text-black" : "text-[#555] hover:text-white"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#111" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#444", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#444", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#666" }}
            itemStyle={{ color: "#fff" }}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill="url(#chartGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
