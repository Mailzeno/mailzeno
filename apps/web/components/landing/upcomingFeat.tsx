"use client";

import { Button } from "@/components/ui/button";
import { LogoPatternDivider } from "@/components/landing/logo-divider";

export function UpcomingFeature() {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 bg-background py-16 sm:py-2">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 px-16 md:grid-cols-2 items-center gap-12 lg:gap-16 mt-8">
          {/* LEFT */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border bg-muted mb-6">
              ✦ Coming Soon
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
              Public Forms for <span className="text-primary">mailzeno</span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto md:mx-0">
              Create hosted forms. Collect submissions. Trigger emails
              automatically - no backend required.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <Button
                variant={"main"}
                type="submit"
                className="py-2 transition"
              >
                Notify Me
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              Launching soon.
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center md:justify-end">
            <LogoPatternDivider />
          </div>
        </div>
      </div>
    </section>
  );
}
