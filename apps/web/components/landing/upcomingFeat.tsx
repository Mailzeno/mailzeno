"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileInput, MailCheck, KeyRound, ArrowRight } from "lucide-react";
import { LogoPatternDivider } from "@/components/landing/logo-divider";

const launchPoints = [
  {
    icon: FileInput,
    title: "Hosted Form Pages",
    description: "Share public form URLs instantly with built-in anti-spam protection.",
  },
  {
    icon: MailCheck,
    title: "Submission to Email Workflows",
    description: "Trigger transactional emails from submissions without writing backend glue.",
  },
  {
    icon: KeyRound,
    title: "Public API Key Support",
    description: "Use form-level public keys for client-side integrations safely.",
  },
];

export function UpcomingFeature() {
  return (
    <section className="bg-background px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-3xl border border-border/70 bg-card/40 p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Forms Now Live
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Build forms, collect submissions, and trigger emails in one flow.
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Your forms module is ready in MailZeno. Create a form, share it
              publicly, and manage submissions from your dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button variant="main" asChild className="gap-2">
                <Link href="/dashboard/forms/new">
                  Create Your First Form
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {launchPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-background/70 p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold sm:text-base">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}

           
          </div>
        </div>
         
      </div>
      <div className="hidden md:flex items-center justify-center">
              <LogoPatternDivider />
            </div>
    </section>
  );
}
