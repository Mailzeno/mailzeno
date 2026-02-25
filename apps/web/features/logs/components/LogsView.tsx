"use client";

import { useState } from "react";
import { LogsTable } from "./LogsTable";
import { LogsMobileList } from "./LogsMobileList";
import { LogDetailDrawer } from "./LogDetailDrawer";

export function LogsView({ logs }: { logs: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <div className="hidden md:block">
        <LogsTable logs={logs} onSelect={setSelected} />
      </div>

      <div className="md:hidden">
        <LogsMobileList logs={logs} onSelect={setSelected} />
      </div>

      {selected && (
        <LogDetailDrawer
          log={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
