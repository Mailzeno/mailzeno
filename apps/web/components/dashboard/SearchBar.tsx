import { Search } from "lucide-react";
import { RefObject, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { navItems } from "@/lib/navitems";
import { cn } from "@/lib/utils";

export function SearchBar({
  searchInputRef,
  className,
}: {
  searchInputRef: RefObject<HTMLInputElement>;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const routes = useMemo(
    () => [
      ...navItems.mainNav,
      ...navItems.configNav,
      ...navItems.analyticsNav,
      ...navItems.systemNav,
    ],
    [],
  );

  const filteredRoutes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return routes;
    return routes.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [query, routes]);

  const handleNavigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className={cn("hidden md:block w-45", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredRoutes[0]) {
              e.preventDefault();
              handleNavigate(filteredRoutes[0].href);
            }
          }}
          className="flex w-full items-center rounded-full border px-3 py-1.5 pl-10 text-sm text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <span className="absolute right-3 top-1/2 rounded-md bg-muted/50 px-1.5 py-1 text-xs -translate-y-1/2 text-muted-foreground">
          ⌘ K
        </span>

        {open && (
          <div className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border bg-background shadow-md">
            {filteredRoutes.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No results found.
              </p>
            ) : (
              filteredRoutes.slice(0, 6).map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleNavigate(item.href)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.href}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
