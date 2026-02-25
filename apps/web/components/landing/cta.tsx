import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="mx-auto mt-32 max-w-5xl px-6 text-center">
      <h2 className="text-3xl font-semibold">
        Ready to send your first email?
      </h2>
      <p className="mt-4 text-muted-foreground">
        Start free. Upgrade only when you need higher limits.
      </p>

      <div className="mt-6">
        <Button size="lg" asChild>
          <Link href="/signup">Get started for free</Link>
        </Button>
      </div>
    </section>
  )
}
