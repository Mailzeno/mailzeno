import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(46, 164, 103, 0.44),transparent_65%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent -z-10" />

      <div className="mx-auto py-10 max-w-6xl px-6">
        <div className="py-10 sm:py-10 lg:py-10 text-center flex flex-col items-center">
          {/* Micro label */}
          <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-4 py-1 text-xs sm:text-sm text-muted-foreground backdrop-blur-md">
            ✦ Modern Email Infrastructure
          </span>

          {/* Heading */}
          <h1 className="mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.03]">
            Design Beautiful Emails <br className="hidden lg:inline" />
            <span className="bg-gradient-to-r font-semibold from-primary to-emerald-400 bg-clip-text text-transparent">
              Send Them with Code
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-8 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Mailzeno lets you create stunning templates, integrate with a
            powerful API, and deliver transactional emails at scale with full
            control, visibility and reliability.
          </p>

          {/* CTA */}
          <div className="mt-12 flex justify-center flex-row gap-4">
            <Button asChild variant="main" size="lg" className="w-auto">
              <Link href="/signup">Get Started</Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-auto">
              <Link href="/docs">Explore Docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
