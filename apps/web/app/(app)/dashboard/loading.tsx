import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 md:px-0 space-y-8">

      {/* Page Title */}
      <Skeleton className="h-8 w-48 rounded-md" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      {/* Chart Section */}
      <Skeleton className="h-72 w-full rounded-xl" />

      {/* Recent Activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-full rounded-lg"
            />
          ))}
        </div>
      </div>

    </div>
  );
}
