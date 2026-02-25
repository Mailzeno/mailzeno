
"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden ">
        <Sidebar
          version={`v${process.env.APP_VERSION} ${process.env.APP_NAME}`}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
