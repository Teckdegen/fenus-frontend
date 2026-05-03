import { useState, useEffect, useMemo, useCallback } from "react";
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

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  group: string;
  snippet: string;
}

const getSearchResults = (query: string): SearchResult[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const section of docsSections) {
    const content = section.content.toLowerCase();
    const titleMatch = section.title.toLowerCase().includes(q);
    const contentIdx = content.indexOf(q);

    if (titleMatch || contentIdx !== -1) {
      let snippet = "";
      if (contentIdx !== -1) {
        const start = Math.max(0, contentIdx - 40);
        const end = Math.min(content.length, contentIdx + query.length + 80);
        const raw = section.content.slice(start, end).replace(/[#*`|_\->\[\]]/g, "").replace(/\n/g, " ");
        snippet = (start > 0 ? "…" : "") + raw.trim() + (end < content.length ? "…" : "");
      } else {
        snippet = section.content.slice(0, 100).replace(/[#*`|_\->\[\]]/g, "").replace(/\n/g, " ").trim() + "…";
      }

      results.push({
        sectionId: section.id,
        sectionTitle: section.title,
        group: section.group,
        snippet,
      });
    }
  }
  return results;
};

const Docs = () => {
  const [activeSection, setActiveSection] = useState(docsSections[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => getSearchResults(searchQuery), [searchQuery]);

  // Keyboard shortcut: Ctrl/Cmd + K
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

  const handleSelectResult = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    setSearchOpen(false);
    setSearchQuery("");
    window.scrollTo(0, 0);
  }, []);

  const currentDoc = docsSections.find((s) => s.id === activeSection) ?? docsSections[0];

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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-accent/30 hover:bg-accent text-muted-foreground text-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search docs…</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Search Dialog */}
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput
            placeholder="Search docs…"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup heading={`${searchResults.length} result${searchResults.length > 1 ? "s" : ""}`}>
                {searchResults.map((r) => (
                  <CommandItem
                    key={r.sectionId}
                    value={r.sectionId + " " + r.sectionTitle}
                    onSelect={() => handleSelectResult(r.sectionId)}
                    className="flex flex-col items-start gap-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">{r.group}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.sectionTitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.snippet}</p>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </header>

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

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-10 lg:px-12">
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
