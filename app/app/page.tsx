import { ASSETS } from "@/lib/mock-data";
import AssetCard from "@/components/AssetCard";

const FILTERS = ["All assets", "ETF", "Technology", "Consumer", "Financials", "Large Cap"];

export default function ExplorePage() {
  return (
    <div className="px-6 py-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Explore Assets</h1>
        <p className="text-xs text-[#555] mt-0.5">Tokenized stocks, ETFs & commodities on LitVM</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-xs">⌕</span>
          <input
            type="text"
            placeholder="Search asset name or ticker"
            className="bg-[#0a0a0a] border border-[#1f1f1f] text-white text-xs rounded-lg pl-8 pr-4 py-2 w-52 placeholder:text-[#444] focus:outline-none focus:border-[#333]"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors
                ${i === 0
                  ? "bg-white text-black font-medium"
                  : "bg-transparent border border-[#1f1f1f] text-[#666] hover:text-white hover:border-[#333]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ASSETS.map((asset) => (
          <AssetCard key={asset.ticker} asset={asset} />
        ))}
      </div>
    </div>
  );
}
