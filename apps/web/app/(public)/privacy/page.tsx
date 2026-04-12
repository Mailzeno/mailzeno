import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "MailZeno Privacy Policy describing how account data, SMTP credentials, API usage logs, and analytics are handled.",
  alternates: {
    canonical: "https://mailzeno.dev/privacy",
  },
};

export default function PrivacyPolicyPage() {
  const tocItems = [
    { id: "scope", label: "1. Scope" },
    { id: "collection", label: "2. Information We Collect" },
    { id: "usage", label: "3. How We Use Information" },
    { id: "security", label: "4. Credential Security" },
    { id: "retention", label: "5. Data Retention" },
    { id: "third-party", label: "6. Third-Party Services" },
    { id: "transfers", label: "7. International Data Transfers" },
    { id: "rights", label: "8. Your Rights" },
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Last updated: April 13, 2026
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs sm:text-sm">
            <Link href="#scope" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Scope
            </Link>
            <Link href="#collection" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Data Collection
            </Link>
            <Link href="#security" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Security
            </Link>
            <Link href="#rights" className="rounded-full border px-3 py-1.5 text-muted-foreground transition hover:text-foreground">
              Your Rights
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
                Privacy Policy
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
            <article id="scope" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">1. Scope</h2>
              <p className="mt-3">
                This Privacy Policy explains how MailZeno collects, uses, and
                protects information when you use our website, dashboard, API,
                SDKs, and related services.
              </p>
            </article>

            <article id="collection" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                2. Information We Collect
              </h2>
              <div className="mt-3 space-y-2">
                <p>
                  Account Information: name, email address, authentication
                  provider details, and account settings.
                </p>
                <p>
                  SMTP Configuration Data: provider metadata, encrypted
                  credentials/tokens, sender details, and connection settings.
                </p>
                <p>
                  Usage Data: API request metadata, timestamps, delivery status,
                  error logs, and dashboard activity required to operate and
                  secure the platform.
                </p>
              </div>
            </article>

            <article id="usage" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                3. How We Use Information
              </h2>
              <div className="mt-3 space-y-2">
                <p>
                  We use data to provide and maintain the service, authenticate
                  users, process email requests, prevent abuse, enforce rate
                  limits, and improve reliability.
                </p>
                <p>
                  We also use operational logs for security monitoring,
                  troubleshooting, and product analytics.
                </p>
              </div>
            </article>

            <article id="security" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                4. Credential Security
              </h2>
              <p className="mt-3">
                Sensitive SMTP and OAuth credential material is encrypted at rest
                before storage. Access is restricted to authorized service
                components required for message delivery.
              </p>
            </article>

            <article id="retention" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                5. Data Retention
              </h2>
              <p className="mt-3">
                We retain account and operational data only as long as needed to
                run the service, comply with legal obligations, and enforce
                platform policies. You may request deletion of your account data
                where applicable.
              </p>
            </article>

            <article id="third-party" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                6. Third-Party Services
              </h2>
              <p className="mt-3">
                MailZeno uses trusted providers for hosting, authentication,
                analytics, and infrastructure. Those providers process data under
                their own policies and contractual obligations.
              </p>
            </article>

            <article id="transfers" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                7. International Data Transfers
              </h2>
              <p className="mt-3">
                Your information may be processed in regions where our service
                providers operate. We take reasonable measures to protect data
                during transfer and processing.
              </p>
            </article>

            <article id="rights" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">
                8. Your Rights
              </h2>
              <p className="mt-3">
                Depending on your jurisdiction, you may have rights to access,
                correct, export, or delete personal data. You can contact us to
                submit a request.
              </p>
            </article>

            <article id="contact" className="border-t pt-8">
              <h2 className="text-2xl font-semibold text-foreground">9. Contact</h2>
              <p className="mt-3">
                For privacy-related requests, contact us at{" "}
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
              By using MailZeno, you also agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Terms of Service
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
