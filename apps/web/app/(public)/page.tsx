import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import {FeatureDuo} from "@/components/landing/feature-duo"
import { Footer } from "@/components/landing/footer"
import { AssistantSystem } from "@/components/landing/assistant-section"
import { FrameworkSupport } from "@/components/landing/useWith"
import { OpenSourceSection } from "@/components/landing/openSource"
import { IntegrateSection } from "@/components/landing/IntegrateSection"
import {LogoPatternDivider} from "@/components/landing/logo-divider"
import {UpcomingFeature} from "@/components/landing/upcomingFeat"

export const metadata = {
  title: "SMTP Email API for Developers",
  description:
    "Use your own SMTP provider and send transactional emails with MailZeno's API and dashboard.",
};

export default function Home() {
  return (
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
  )
}
