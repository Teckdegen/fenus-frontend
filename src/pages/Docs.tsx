import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { docsSections, docsGroups } from "@/lib/docsContent";
import { cn } from "@/lib/utils";
import { Book, ChevronRight, Menu, X, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const Docs = () => {
  const [activeSection, setActiveSection] = useState(docsSections[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentDoc = docsSections.find((s) => s.id === activeSection) ?? docsSections[0];

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return docsSections
      .filter((s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
      .map((s) => {
        const idx = s.content.toLowerCase().indexOf(q);
        const snippet = idx >= 0
          ? "..." + s.content.slice(Math.max(0, idx - 40), idx + 60).replace(/\n/g, " ") + "..."
          : "";
        return { ...s, snippet };
      });
  }, [searchQuery]);

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
          <div className="ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search docs...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-accent px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search docs..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults.length > 0 && (
            <CommandGroup heading="Results">
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setActiveSection(result.id);
                    setSearchOpen(false);
                    setSearchQuery("");
                    window.scrollTo(0, 0);
                  }}
                  className="flex flex-col items-start gap-1 cursor-pointer"
                >
                  <span className="text-xs text-muted-foreground">{result.group}</span>
                  <span className="font-medium text-foreground">{result.title}</span>
                  {result.snippet && (
                    <span className="text-xs text-muted-foreground line-clamp-1">{result.snippet}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-40 w-72 border-r border-border bg-background overflow-y-auto transition-transform duration-200 shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="py-6 px-4 space-y-6">
            {docsGroups.map((group) => {
              const items = docsSections.filter((s) => s.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-3">
                    {group}
                  </h3>
                  <ul className="space-y-0.5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2",
                            activeSection === item.id
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          {activeSection === item.id && (
                            <ChevronRight className="w-3 h-3 shrink-0" />
                          )}
                          <span>{item.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content - full width */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-10 sm:px-10 md:px-16 lg:px-24 xl:px-32">
            <h1 className="text-3xl lg:text-4xl font-bold mb-8 tracking-tight">
              {currentDoc.title}
            </h1>

            <article className="docs-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-10 mb-4 pb-2 border-b border-border text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-8 mb-3 text-foreground">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1.5 mb-4 text-muted-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1.5 mb-4 text-muted-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground leading-relaxed">
                      <span className="text-muted-foreground">{children}</span>
                    </li>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6 rounded-lg border border-border">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-accent/50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="text-left px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider border-b border-border">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-muted-foreground border-b border-border/50">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-8 border-border" />,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <code className="block bg-accent/70 rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto mb-4">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="bg-accent/70 text-foreground px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground mb-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {currentDoc.content}
              </ReactMarkdown>
            </article>

            {/* Prev/Next navigation */}
            <div className="flex justify-between mt-16 pt-6 border-t border-border">
              {(() => {
                const idx = docsSections.findIndex((s) => s.id === activeSection);
                const prev = idx > 0 ? docsSections[idx - 1] : null;
                const next = idx < docsSections.length - 1 ? docsSections[idx + 1] : null;
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => { setActiveSection(prev.id); window.scrollTo(0, 0); }}
                        className="text-left group"
                      >
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Previous</span>
                        <p className="text-sm font-medium text-foreground group-hover:underline">{prev.title}</p>
                      </button>
                    ) : (
                      <div />
                    )}
                    {next ? (
                      <button
                        onClick={() => { setActiveSection(next.id); window.scrollTo(0, 0); }}
                        className="text-right group"
                      >
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Next</span>
                        <p className="text-sm font-medium text-foreground group-hover:underline">{next.title}</p>
                      </button>
                    ) : (
                      <div />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
