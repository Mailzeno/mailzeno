"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function LogsHeader({ currentStatus }: { currentStatus: string }) {
  const statuses = ["all", "sent", "failed"];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">
          Email Logs
        </h1>
        <p className="text-muted-foreground text-sm">
          Track delivery and failures.
        </p>
      </div>

      <div className="flex gap-2">
        {statuses.map((status) => (
          <Link
            key={status}
            href={`/dashboard/logs?status=${status}`}
            className={`px-3 py-1.5 text-sm rounded-full border capitalize ${
              currentStatus === status
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {status}
          </Link>
        ))}
      </div>
    </div>
  );
}
