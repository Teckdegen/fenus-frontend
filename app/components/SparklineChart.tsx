"use client";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

interface Props {
  data: { v: number }[];
  up: boolean;
}

export default function SparklineChart({ data, up }: Props) {
  const color = up ? "#22c55e" : "#ef4444";
  const fill = up ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${up}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#g-${up})`}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={() => null}
          cursor={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
