"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Quote, FileText } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  title: string;
  description: string;
  author: string;
  company: string;
}

interface Props {
  testimonials: Testimonial[];
}

export function RightComponent({ testimonials }: Props) {
  const pathname = usePathname();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  function pickRandom() {
    if (!testimonials.length) return null;
    const index = Math.floor(Math.random() * testimonials.length);
    return testimonials[index];
  }

  useEffect(() => {
    setTestimonial(pickRandom());
  }, [pathname]); 

  if (!testimonial) return null;

  return (
    <section className="relative hidden lg:flex items-center justify-center bg-muted/40 px-20">
      
      <div className="absolute p-1 rounded-md border border-border bg-muted right-6 top-6 z-10">
        <Link href="/docs" className="inline-flex items-center pt-1 gap-1 text-sm">
          <FileText className="h-4 w-4" />
          Documentation
        </Link>
      </div>

      <div className="max-w-xl relative">
        <Quote className="absolute rotate-180 -left-16 -top-10 h-16 w-16 text-muted-foreground/20" />

        <p className="text-4xl font-medium leading-tight">
          {testimonial.title}
        </p>

        <p className="mt-6 text-lg text-muted-foreground">
          {testimonial.description}
        </p>

        <p className="mt-10 text-sm text-muted-foreground">
          @{testimonial.author} <br />
          <span className="text-xs">{testimonial.company}</span>
        </p>
      </div>
    </section>
  );
}
