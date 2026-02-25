"use client";

import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface SearchItem {
  slug: string;
  title: string;
  content: string;
}

export function SearchDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [loading, setLoading] = useState(true);

  // Load search index
  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchItem[]) => {
        const fuseInstance = new Fuse(data, {
          keys: ["title", "content"],
          threshold: 0.35,
        });
        setFuse(fuseInstance);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  // Search logic
  useEffect(() => {
    if (!query || !fuse) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    const res = fuse.search(query).slice(0, 8);
    setResults(res.map((r) => r.item));
    setActiveIndex(0);
  }, [query, fuse]);

  // Scroll active item
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Keyboard navigation (only when open)
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }

      if (e.key === "Enter") {
        const selected = results[activeIndex];
        if (selected) {
          e.preventDefault();
          router.push(`/${selected.slug}`);
          setOpen(false);
          setQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [open, results, activeIndex, router, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-md flex items-start justify-center pt-28 animate-in fade-in">
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-2xl bg-bg-primary border border-border-primary shadow-2xl overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border-primary">
          <Search className="w-5 h-5 text-text-tertiary" />
          <input
            autoFocus
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base placeholder:text-text-tertiary"
          />
          <div className="text-xs px-2 py-1 rounded-md bg-bg-secondary text-text-tertiary border border-border-primary">
            ⌘ K
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 flex items-center gap-2 text-sm text-text-tertiary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading index...
            </div>
          ) : results.length > 0 ? (
            <ul ref={listRef}>
              {results.map((item, index) => (
                <li
                  key={item.slug}
                  onClick={() => {
                    router.push(`/${item.slug}`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`px-4 py-3 cursor-pointer transition rounded-lg mx-2 my-1 ${
                    index === activeIndex
                      ? "bg-accent-muted text-accent-secondary"
                      : "hover:bg-bg-hover"
                  }`}
                >
                  <div className="font-medium capitalize">
                    {item.title}
                  </div>
                  <div className="text-xs text-text-tertiary truncate">
                    {item.content.slice(0, 100)}...
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            query && (
              <div className="p-6 text-sm text-text-tertiary text-center">
                No results found for{" "}
                <span className="font-medium">"{query}"</span>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 text-xs text-text-tertiary border-t border-border-primary flex justify-between">
          <span className="font-medium bg-bg-secondary px-2 py-1 border border-border-secondary rounded-md">
            ↑ ↓ navigate
          </span>
          <span className="font-medium bg-bg-secondary px-2 py-1 border border-border-secondary rounded-md">
            Enter select
          </span>
          <span className="font-medium bg-bg-secondary px-2 py-1 border border-border-secondary rounded-md">
            Esc close
          </span>
        </div>
      </div>
    </div>
  );
}