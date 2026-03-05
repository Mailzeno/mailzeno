"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  onMenuToggle: () => void;
  isOpen: boolean;
}

export function Header({ onMenuToggle, isOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted] = useState(true);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed md:top-4 top-0 rounded-b-2xl left-0 right-0 mx-auto w-full max-w-2xl sm:rounded-full h-16 shadow-xs flex items-center justify-between px-4 sm:px-6 bg-bg-header backdrop-blur-md md:border border-border-primary z-[100] transition-colors duration-300">
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}

        <Link href="/app" className="flex items-center gap-1 no-underline">
          <Image src="/logo.svg" alt="Mailzeno Logo" width={50} height={50} />
          <span className="text-2xl font-bold text-text-heading tracking-tight">
            mailzeno
          </span>
          <span className="text-[0.6875rem] font-medium text-text-heading px-[0.4em] py-[0.1em] rounded border border-border-primary bg-bg-tertiary sm:inline">
            Docs
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-md border border-border-primary text-text-tertiary no-underline transition-all duration-150 hover:text-text-primary hover:border-border-secondary hover:bg-bg-hover active:bg-bg-active"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        {/* GitHub link */}
        <a
          href="https://github.com/mailzeno"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-md border border-border-primary text-text-tertiary no-underline transition-all duration-150 hover:text-text-primary hover:border-border-secondary hover:bg-bg-hover active:bg-bg-active"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>

        <button
          onClick={onMenuToggle}
          className="md:hidden  flex h-9 w-9 flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-text-heading transition-all ${
              isOpen && "rotate-45"
            }`}
          />
          <span
            className={`h-0.5 w-3 bg-text-heading transition-all ${
              isOpen ? "-rotate-45 w-5 -translate-y-2" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </header>
  );
}
