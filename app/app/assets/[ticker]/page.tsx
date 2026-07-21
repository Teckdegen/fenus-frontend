import { ASSETS } from "@/lib/mock-data";
import AssetChart from "@/components/AssetChart";
import TradePanel from "@/components/TradePanel";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ ticker: string }>;
}

export default async function AssetPage({ params }: Props) {
  const { ticker } = await params;
  const asset = ASSETS.find((a) => a.ticker === ticker.toUpperCase());
  if (!asset) notFound();

  return (
    <div className="px-6 py-8 max-w-[1100px]">
      {/* Back */}
      <Link href="/" className="text-xs text-[#555] hover:text-white mb-6 inline-flex items-center gap-1 transition-colors">
        ← Back to Explore
      </Link>

      {/* Asset header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <img
          src={asset.logoUrl}
          alt={asset.ticker}
          width={40}
          height={40}
          className="rounded-full bg-[#111]"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{asset.name}</h1>
            <span className="text-[#555] text-sm font-normal">{asset.ticker}on</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Chart */}
        <AssetChart
          up={asset.up}
          price={asset.price}
          change={asset.change}
          changePct={asset.changePct}
        />

        {/* Trade panel */}
        <TradePanel ticker={asset.ticker} price={asset.price} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {[
          { label: "24H Volume", value: asset.volume },
          { label: "Market Cap", value: "—" },
          { label: "24H High", value: `$${(asset.price * 1.022).toFixed(2)}` },
          { label: "24H Low", value: `$${(asset.price * 0.978).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3">
            <div className="text-[10px] text-[#444] mb-1">{s.label}</div>
            <div className="text-sm font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
