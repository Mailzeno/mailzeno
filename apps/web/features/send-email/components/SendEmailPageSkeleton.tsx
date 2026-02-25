export default function SendEmailPageSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      {/* Email Form Section Skeleton */}
      <div className="border rounded-xl p-6 bg-card space-y-6">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />

        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />

        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
      </div>

      {/* Message Editor Skeleton */}
      <div className="border rounded-xl p-6 bg-card space-y-6">
        
        {/* Editor Header Row */}
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-muted rounded" />
            <div className="h-7 w-20 bg-muted rounded" />
            <div className="h-7 w-20 bg-muted rounded" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-8 w-8 bg-muted rounded-md" />
          ))}
        </div>

        {/* Editor Body */}
        <div className="h-[300px] bg-muted rounded-lg" />
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <div className="h-10 w-40 bg-muted rounded-md" />
      </div>
    </div>
  );
}
