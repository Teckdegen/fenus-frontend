"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Explore" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function TopNav() {
  const path = usePathname();
  return (
    <>
      {/* ── Top bar (all screens) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a] h-12 flex items-center px-5 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="FENUS" className="w-5 h-5" />
          <span className="font-semibold text-sm text-white tracking-tight">FENUS</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors
                  ${active ? "bg-white text-black font-medium" : "text-[#666] hover:text-white"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet stub */}
        <div className="flex items-center gap-2">
          <button className="text-xs border border-[#1f1f1f] text-[#666] px-3 py-1.5 rounded-full hover:border-[#333] hover:text-white transition-colors">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#1a1a1a] flex">
        {nav.map((n) => {
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs transition-colors
                ${active ? "text-white" : "text-[#555]"}`}
            >
              <span className={`w-1 h-1 rounded-full mb-1 ${active ? "bg-white" : "bg-transparent"}`} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
