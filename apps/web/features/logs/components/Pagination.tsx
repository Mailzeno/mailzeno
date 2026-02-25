"use client";

import Link from "next/link";

export function Pagination({
  total,
  pageSize,
  currentPage,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
}) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      {currentPage > 1 && (
        <Link
          href={`?page=${currentPage - 1}`}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted"
        >
          Previous
        </Link>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={`?page=${currentPage + 1}`}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted"
        >
          Next
        </Link>
      )}
    </div>
  );
}
