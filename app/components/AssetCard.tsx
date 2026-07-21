"use client";
import Link from "next/link";
import { Asset, getSparkline } from "@/lib/mock-data";
import SparklineChart from "./SparklineChart";

export default function AssetCard({ asset }: { asset: Asset }) {
  const spark = getSparkline(asset.ticker);
  return (
    <Link
      href={`/assets/${asset.ticker}`}
      className="group block bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#333] transition-colors"
    >
      {/* Top row */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={asset.logoUrl}
          alt={asset.ticker}
          width={24}
          height={24}
          className="rounded-full bg-[#111]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <div className="text-xs font-semibold text-white leading-none">
            {asset.ticker}<span className="text-[#444] font-normal">on</span>
          </div>
          <div className="text-[10px] text-[#444] mt-0.5 truncate max-w-[100px]">{asset.name}</div>
        </div>
      </div>

      {/* Price */}
      <div className="text-xl font-semibold text-white mb-1">
        ${asset.price.toFixed(2)}
      </div>

      {/* Change */}
      <div className={`text-[11px] mb-3 ${asset.up ? "text-green-400" : "text-red-400"}`}>
        {asset.up ? "▲" : "▼"} ${Math.abs(asset.change).toFixed(2)} ({Math.abs(asset.changePct).toFixed(2)}%) · {asset.volume}
      </div>

      {/* Sparkline */}
      <SparklineChart data={spark} up={asset.up} />
    </Link>
  );
}
