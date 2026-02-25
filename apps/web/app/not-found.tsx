import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 overflow-hidden">

      {/* Premium Grid Background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)/0.35) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)/0.35) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(circle at center, black 60%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-2xl text-center space-y-10">

        {/* 404 Heading */}
        <div className="space-y-6">
          <h1 className="text-[110px] sm:text-[140px] font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground/40 bg-clip-text text-transparent">
            404
          </h1>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-foreground">
              Page not found
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              The page you’re looking for doesn’t exist or may have been moved.
              Let’s get you back on track.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-5">

          {/* Home CTA */}
          <a
            href="/"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-btn-border bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:opacity-95 hover:scale-[1.02]"
          >
            Go Home
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>

          {/* Docs CTA */}
          <a
            href="/docs"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-border bg-background/60 backdrop-blur px-8 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted hover:scale-[1.02]"
          >
            Documentation
          </a>

        </div>

        <p className="text-xs text-muted-foreground/70">
          Error 404 — The requested page could not be found.
        </p>

      </div>
    </div>
  );
}