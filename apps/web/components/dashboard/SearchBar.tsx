import { Search } from "lucide-react";
import { RefObject } from "react";

export function SearchBar({
  searchInputRef,
}: {
  searchInputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <div className="hidden md:block w-45">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          className="flex w-full items-center rounded-full border px-3 py-1.5 pl-10 text-sm text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <span className="absolute right-3 top-1/2 rounded-md bg-muted/50 px-1.5 py-1 text-xs -translate-y-1/2 text-muted-foreground">
          ⌘ K
        </span>
      </div>
    </div>
  );
}
