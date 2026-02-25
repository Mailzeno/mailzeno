"use client";

export default function SMTPSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card p-6 animate-pulse space-y-4"
        >
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-muted rounded-md" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
