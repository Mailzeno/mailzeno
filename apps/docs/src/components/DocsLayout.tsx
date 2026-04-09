"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header
        isOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[260px] mt-20 min-h-[calc(100vh-3.5rem)] transition-colors duration-300">
        <div className="flex gap-6 xl:gap-12 max-w-[1100px] mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
          <main className="prose animate-fade-in flex-1 min-w-0 overflow-x-hidden">
            {children}
          </main>
          <aside className="hidden lg:block w-56">
            <TableOfContents />
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-border-primary py-6 px-4 sm:px-8 text-center text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} MailZeno <span className="bg-bg-tertiary px-1.5 py-0.5 border border-border-secondary rounded-sm">Docs</span>
        </footer>
      </div>
    </>
  );
}
