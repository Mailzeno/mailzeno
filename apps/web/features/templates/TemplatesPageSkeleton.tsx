export function TemplatesPageSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-full sm:w-40 bg-muted rounded" />
      </div>

      {/* Search */}
      <div className="h-10 w-full sm:max-w-sm bg-muted rounded" />

      {/* Starter Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-56 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-7 w-20 bg-muted rounded-full"
            />
          ))}
        </div>

        {/* Starter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-4 sm:p-5 bg-card space-y-4"
            >
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
              <div className="h-9 w-full bg-muted rounded mt-4" />
            </div>
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-4 sm:p-5 bg-card space-y-4"
            >
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
