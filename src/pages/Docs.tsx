import { useState } from "react";
import { Book, Menu, X, ArrowLeft, Search, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type DocSection = {
  title: string;
  items: { title: string; slug: string }[];
};

const sections: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "introduction" },
      { title: "Quick Start", slug: "quick-start" },
    ],
  },
  {
    title: "Using the App",
    items: [
      { title: "Dashboard & Balances", slug: "dashboard" },
      { title: "Faucet", slug: "faucet" },
    ],
  },
  {
    title: "Trove",
    items: [
      { title: "What is a Trove?", slug: "what-is-a-trove" },
      { title: "Open a Trove", slug: "open-a-trove" },
      { title: "Managing Collateral", slug: "managing-collateral" },
      { title: "Borrow & Repay", slug: "borrow-repay" },
      { title: "Close a Trove", slug: "close-a-trove" },
    ],
  },
  {
    title: "Beyond Borrowing",
    items: [
      { title: "Pools & Liquidity", slug: "pools" },
      { title: "Protocol Parameters", slug: "parameters" },
    ],
  },
  {
    title: "Tokenomics & Governance",
    items: [{ title: "FNS Governance", slug: "fns-governance" }],
  },
];

const Docs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");

  const filteredSections = query
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter((i) =>
            i.title.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-sm tracking-wide">FENUS Docs</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 lg:top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-72 border-r border-border bg-background overflow-y-auto transition-transform duration-200 shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full"
          )}
        >
          {/* Search */}
          <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full h-9 pl-9 pr-3 rounded-md bg-accent/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <nav className="py-4 px-3 space-y-6">
            {filteredSections.length === 0 && (
              <div className="text-sm text-muted-foreground px-2">No results.</div>
            )}
            {filteredSections.map((section) => (
              <div key={section.title}>
                <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </div>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.slug}>
                      <button
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-left"
                      >
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-10">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/50">
                <Book className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Coming Soon
              </h1>
              <p className="mt-3 text-muted-foreground">
                The FENUS documentation is under construction. Check back shortly.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
