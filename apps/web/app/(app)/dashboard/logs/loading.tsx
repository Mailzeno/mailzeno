export default function LogsLoading() {
  return (
    <div className="px-4 md:px-0 space-y-8">
      {/* Header skeleton */}
      <div className="h-8 w-40 bg-muted rounded animate-pulse" />

      {/* Table skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="h-10 w-60 bg-muted rounded animate-pulse" />
    </div>
  );
}
