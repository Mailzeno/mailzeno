"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import logo from "@/public/logo.svg";

export function Footer() {
  return (
    <footer className="relative border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Top Row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="space-y-1">
            <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
             className="flex items-center cursor-pointer">
              <img src={logo.src} alt="MailZeno Logo" className="h-10 w-auto" />
              <h3 className="text-xl font-semibold tracking-tight">mailzeno</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Developer-first SMTP infrastructure.
            </p>
          </div>

          {/* Links Wrapper */}
          <div className="flex flex-wrap justify-between gap-x-10 gap-y-6 text-sm">
            {/* Product */}
            <div className="flex flex-col gap-2 min-w-[120px]">
              <span className="font-medium text-lg text-foreground">
                Product
              </span>
              <Link
                href="/docs"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Docs
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Pricing
              </Link>
              <Link
                href="/docs/changelog"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Changelog
              </Link>
            </div>

            {/* Community */}
            <div className="flex flex-col gap-2 min-w-[120px]">
              <span className="font-medium text-lg text-foreground">
                Community
              </span>
              <Link
                href="https://github.com/mailzeno/mailzeno"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
              >
                GitHub
              </Link>
              <Link
                href="/roadmap"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Roadmap
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Blog
              </Link>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-2 min-w-[120px]">
              <span className="font-medium text-lg text-foreground">
                Legal
              </span>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Right Utility */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <ThemeToggle />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MailZeno. Built in public.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
