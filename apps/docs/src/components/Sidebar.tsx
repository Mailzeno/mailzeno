"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/docs";
import { Search } from "lucide-react";
import { useSearch } from "@/components/SearchProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSearch();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden"
        />
      )}
      <div className="bg-bg-primary hidden lg:block top-0 z-50 fixed w-[260px] h-16 flex items-center px-4">
        <button
         onClick={() => setOpen(true)}
          className="w-full flex items-center mt-6 bg-bg-tertiary border border-border-primary rounded-full px-4 py-2 hover:bg-bg-hover cursor-pointer transition-all"
        >
          <Search className="w-4 h-4 text-text-secondary mr-2" />

          <div className="flex items-center justify-between w-full text-sm text-text-secondary">
            <span>Search...</span>

            <span className="ml-3 text-[0.65rem] font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-secondary">
              ⌘ K
            </span>
          </div>
        </button>
      </div>
      <aside
        className={`fixed top-17 left-0 bottom-0 w-[280px] sm:w-[260px] overflow-y-auto border-r border-border-primary bg-bg-primary py-6 z-50 transition-transform duration-200 ease-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav>
          {navigation.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="px-5 sm:px-6 mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                {section.title}
              </div>
              <ul className="list-none p-2 rounded-md">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li className="m-2" key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-2 py-2 sm:py-1.5 px-5 sm:px-6 leading-relaxed no-underline transition-all duration-150  ${
                          isActive
                            ? "font-semibold text-accent-secondary rounded-md mx-2 bg-accent-muted"
                            : "font-semibold text-text-secondary  rounded-md mx-2 bg-transparent border-r-transparent hover:text-text-primary hover:bg-bg-hover active:bg-bg-active"
                        }`}
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="inline-flex items-center gap-1 py-[0.15em] px-2 text-[0.65rem] font-semibold rounded-full font-mono tracking-wide bg-[rgb(251_191_36/0.12)] text-warning border border-[rgb(251_191_36/0.25)]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
