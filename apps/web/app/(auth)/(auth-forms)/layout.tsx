import React from "react";
import { AllTestimonials } from "@/lib/server/testimonials";
import { RightComponent } from "@/components/auth/right-component";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const testimonials = await AllTestimonials();

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[35%_65%]">
        
        <section className="flex items-center justify-center">
          {children}
        </section>

        <RightComponent testimonials={testimonials} />

      </div>
    </main>
  );
}
