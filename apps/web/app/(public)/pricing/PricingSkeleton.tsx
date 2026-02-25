export default function PricingSkeleton() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">

        <div className="text-center space-y-4 mb-14">
          <div className="h-6 w-64 mx-auto bg-muted animate-pulse rounded" />
          <div className="h-4 w-80 mx-auto bg-muted animate-pulse rounded" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border rounded-xl bg-card p-6 space-y-4 animate-pulse"
            >
              <div className="h-5 w-24 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded" />
              </div>
              <div className="h-9 bg-muted rounded mt-4" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}