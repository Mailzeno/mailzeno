"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navItems } from "@/lib/navitems";
import clsx from "clsx";

const { mainNav, configNav, analyticsNav, systemNav } = navItems;

export function Sidebar({
  version,
  isOpen,
  onClose,
}: {
  version?: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);

  const renderGroup = (items: typeof mainNav) =>
    items.map((item) => {
      const isActive =
        pathname === item.href || pathname.startsWith(item.href + "/");

      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClose}
          className={clsx(
            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-w-0",
            isActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
          )}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-lg bg-muted"
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />
          )}

          <item.icon className="relative z-10 h-4 w-4 shrink-0" />
          <span className="relative z-10 truncate">{item.name}</span>
        </Link>
      );
    });

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-56 flex-col border-r bg-background">
        <SidebarContent
          version={version}
          renderGroup={renderGroup}
          onClose={onClose}
        />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 top-0 h-[100dvh] w-64 bg-background shadow-xl"
            >
              <SidebarContent
                version={version}
                renderGroup={renderGroup}
                onClose={onClose}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  version,
  renderGroup,
  onClose,
}: {
  version?: string;
  renderGroup: any;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo Section */}
      <div className="h-16 md:hidden flex items-center px-6 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center text-lg font-bold"
        >
          <img src="/logo.svg" alt="Logo" className="h-8" />
          <span className="ml-0.5">
            mailzeno
          </span>
        </Link>
      </div>

      {/* Divider */}
      <div className="border-b" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            {renderGroup(mainNav)}
          </div>

          <div className="flex flex-col gap-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Configuration
            </p>
            <div className="flex flex-col gap-1">
              {renderGroup(configNav)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Analytics
            </p>
            <div className="flex flex-col gap-1">
              {renderGroup(analyticsNav)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              System
            </p>
            <div className="flex flex-col gap-1">
              {renderGroup(systemNav)}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t text-center px-4 py-4 text-xs text-muted-foreground truncate shrink-0">
        {version}
      </div>
    </div>
  );
}
