"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { Github, ChevronDown } from "lucide-react";

export function DocsMegaMenu() {
  return (
    <div className="relative group">
      <Link
        href="/docs"
        className="group flex items-center gap-1 transition hover:text-foreground"
      >
        Documentation
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
      </Link>

      {/* Mega Menu */}
      <div
        className="absolute left-1/2 top-9 z-40 mt-4 w-[520px]
        -translate-x-1/2 rounded-xl border bg-background shadow-xl
        opacity-0 invisible
        transition-all duration-200
        group-hover:opacity-100
        group-hover:visible"
      >
        <div className="grid grid-cols-2 gap-6 p-6">
          {/* Column 1 */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">GUIDES</p>

            <Link
              href="/docs/getting-started"
              className="block rounded-lg p-2 hover:bg-muted"
            >
              <p className="font-medium">Getting Started</p>
              <p className="text-sm text-muted-foreground">
                Send your first beautiful email in minutes
              </p>
            </Link>

            <Link
              href="/docs/templates"
              className="block rounded-lg p-2 hover:bg-muted"
            >
              <p className="font-medium">Templates</p>
              <p className="text-sm text-muted-foreground">
                Reusable email templates
              </p>
            </Link>
          </div>

          {/* Column 2 */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">DEVELOPERS</p>

            <Link
              href="/docs/api-reference"
              className="block rounded-lg p-2 hover:bg-muted"
            >
              <p className="font-medium">API Reference</p>
              <p className="text-sm text-muted-foreground">
                Integrate with mailzeno
              </p>
            </Link>

            <Link
              href="/docs/changelog"
              className="block rounded-lg p-2 hover:bg-muted"
            >
              <p className="font-medium">Changelog</p>
              <p className="text-sm text-muted-foreground">Latest updates</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
