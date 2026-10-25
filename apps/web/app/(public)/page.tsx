import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { FeatureDuo } from "@/components/landing/feature-duo"
import { Footer } from "@/components/landing/footer"
import { AssistantSystem } from "@/components/landing/assistant-section"
import { FrameworkSupport } from "@/components/landing/useWith"
import { OpenSourceSection } from "@/components/landing/openSource"
import { IntegrateSection } from "@/components/landing/IntegrateSection"
import { LogoPatternDivider } from "@/components/landing/logo-divider"
import { UpcomingFeature } from "@/components/landing/upcomingFeat"
import { SmoothScroll } from "@/components/smooth-scroll"

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MailZeno – Send Emails via Your Own SMTP | Developer Email API",
  description:
    "Open-source, developer-first email API. Bring your own SMTP provider, send transactional emails with a simple REST API or Node.js SDK. Real-time logs, templates, analytics dashboard — all self-hosted. Free alternative to Resend, SendGrid & Postmark.",
  keywords: [
    "email API",
    "SMTP API",
    "transactional email API",
    "send email via API",
    "open source email",
    "bring your own SMTP",
    "Resend alternative",
    "SendGrid alternative",
    "Node.js email SDK",
    "developer email platform",
    "self-hosted email",
    "email infrastructure",
  ],
  alternates: {
    canonical: "https://mailzeno.dev",
  },
  openGraph: {
    title: "MailZeno – Developer-First Email API & SMTP Platform",
    description:
      "Bring your own SMTP. Send transactional emails with a simple REST API or Node.js SDK. Open-source, self-hosted, with real-time logs and analytics.",
    url: "https://mailzeno.dev",
    type: "website",
    images: [{ url: "/og.webp", width: 1200, height: 630, alt: "MailZeno – Developer-first email API" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MailZeno – Open-Source Email API for Developers",
    description:
      "Send transactional emails using your own SMTP. REST API, Node.js SDK, real-time logs, and templates.",
    images: ["/og.webp"],
  },
};


export default function Home() {
  return (
    <SmoothScroll>
      <main>
        <Hero />
        <FeatureDuo />
        <FrameworkSupport />
        <AssistantSystem />
        <OpenSourceSection />
        <IntegrateSection />
        <Features />
        <CTA />
        <UpcomingFeature />
      </main>
    </SmoothScroll>
  )
}
