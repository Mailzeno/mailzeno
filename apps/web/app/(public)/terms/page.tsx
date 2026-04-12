import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "MailZeno Terms of Service outlining acceptable use, billing, account responsibilities, and platform limitations.",
  alternates: {
    canonical: "https://mailzeno.dev/terms",
  },
};

export default function TermsPage() {
  const tocItems = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "service", label: "2. Service Description" },
    { id: "account", label: "3. Account Responsibilities" },
    { id: "use", label: "4. Acceptable Use" },
    { id: "third-party", label: "5. Third-Party Integrations" },
    { id: "billing", label: "6. Fees and Billing" },
    { id: "liability", label: "7. Disclaimers and Liability" },
    { id: "changes", label: "8. Changes to Terms" },
    { id: "contact", label: "9. Contact" },
  ];

  return (
    <section className="relative border-y p-6 bg-background">
      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-12">
        <div className="lg:hidden">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Last updated: April 13, 2026
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
            <Link href="#acceptance" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Acceptance
            </Link>
            <Link href="#use" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Acceptable Use
            </Link>
            <Link href="#billing" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Billing
            </Link>
            <Link href="#liability" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Liability
            </Link>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-12">
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
            <div className="border-l pl-5 pb-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Legal
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Last updated: April 13, 2026
              </p>

              <p className="mt-6 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                On this page
              </p>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                {tocItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-10 text-sm leading-7 text-muted-foreground sm:text-base lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-3">
            <article id="acceptance" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing or using MailZeno, you agree to these Terms. If you
                do not agree, do not use the service.
              </p>
            </article>

            <article id="service" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                2. Service Description
              </h2>
              <p className="mt-3">
                MailZeno provides developer tools to send email via connected SMTP
                providers, including dashboards, APIs, SDKs, templates, logs, and
                related features.
              </p>
            </article>

            <article id="account" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                3. Account Responsibilities
              </h2>
              <div className="mt-3 space-y-2">
                <p>
                  You are responsible for safeguarding credentials, account
                  access, and API keys associated with your workspace.
                </p>
                <p>
                  You must provide accurate information and keep your account
                  details up to date.
                </p>
              </div>
            </article>

            <article id="use" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                4. Acceptable Use
              </h2>
              <div className="mt-3 space-y-2">
                <p>
                  You agree not to use MailZeno for spam, phishing, malware,
                  unlawful messaging, harassment, or any activity that violates
                  applicable law.
                </p>
                <p>
                  We may suspend or terminate accounts involved in abuse,
                  excessive risk, or policy violations.
                </p>
              </div>
            </article>

            <article id="third-party" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                5. Third-Party Integrations
              </h2>
              <p className="mt-3">
                You are responsible for complying with the terms of third-party
                providers connected to MailZeno (such as SMTP and OAuth-based
                providers).
              </p>
            </article>

            <article id="billing" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                6. Fees and Billing
              </h2>
              <p className="mt-3">
                Paid plan pricing, limits, and billing rules are shown in the
                product. You authorize charges according to your selected plan.
                Taxes may apply based on jurisdiction.
              </p>
            </article>

            <article id="liability" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                7. Disclaimers and Liability
              </h2>
              <p className="mt-3">
                MailZeno is provided on an "as is" and "as available" basis.
                To the maximum extent permitted by law, we disclaim implied
                warranties and are not liable for indirect, incidental, special,
                consequential, or punitive damages.
              </p>
            </article>

            <article id="changes" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                8. Changes to Terms
              </h2>
              <p className="mt-3">
                We may update these Terms from time to time. Continued use of the
                service after updates means you accept the revised Terms.
              </p>
            </article>

            <article id="contact" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">9. Contact</h2>
              <p className="mt-3">
                Questions about these Terms can be sent to{" "}
                <a
                  href="mailto:support@mailzeno.dev"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  support@mailzeno.dev
                </a>
                .
              </p>
            </article>

            <div className="mt-12 border-t pt-6 text-sm text-muted-foreground sm:text-base">
              Please also review our{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
