import { useState } from "react";
import { Book, Menu, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Docs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-40 w-72 border-r border-border bg-background overflow-y-auto transition-transform duration-200 shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="py-6 px-4">
            <div className="rounded-lg bg-accent/50 px-3 py-2 text-sm text-muted-foreground">
              Documentation is being prepared.
            </div>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
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
