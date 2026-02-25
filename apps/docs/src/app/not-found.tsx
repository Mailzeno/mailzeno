
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-6 overflow-hidden">

      {/* Subtle Grid Background (Docs tone) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border-secondary)/0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border-secondary)/0.3) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(circle at center, black 60%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-2xl text-center space-y-10">

        {/* 404 */}
        <div className="space-y-6">
          <h1 className="text-[110px] sm:text-[140px] font-bold tracking-tight bg-gradient-to-b from-text-primary to-text-tertiary/40 bg-clip-text text-transparent">
            404
          </h1>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-text-primary">
              Documentation not found
            </h2>

            <p className="text-text-tertiary max-w-lg mx-auto text-sm sm:text-base">
              The documentation page you’re looking for doesn’t exist or may
              have been renamed.
            </p>
          </div>
        </div>

        <p className="text-xs text-text-tertiary/70">
          Error 404 — Page not found
        </p>

      </div>
    </div>
  );
}