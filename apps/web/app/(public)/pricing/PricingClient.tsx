"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import PricingSkeleton from "./PricingSkeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type Plan = "free" | "pro" | null;

export default function PricingClient() {
  const router = useRouter();
  const supabase = createClient();

  const [plan, setPlan] = useState<Plan>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("plan, pro_expires_at")
        .eq("id", user.id)
        .single();

      if (data?.plan === "pro") {
        if (!data.pro_expires_at || new Date(data.pro_expires_at) > new Date()) {
          setPlan("pro");
        } else {
          setPlan("free");
        }
      } else {
        setPlan("free");
      }

      setLoading(false);
    }

    fetchPlan();
  }, [supabase]);

  const handleClick = async (target: Plan) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/pricing`);
      return;
    }

    if (target === "pro") {
      router.push("/contact");
    }
  };

  if (loading) return <PricingSkeleton />;

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">

        {/* Heading */}
        <div className="text-center space-y-4 mb-14">
          <h1 className="text-3xl font-bold">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Bring your own SMTP. Pay for infrastructure, not markups.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* FREE */}
          <div className="border rounded-xl bg-card p-6 flex flex-col">
            <h2 className="text-lg font-bold mb-1">Free</h2>
            <p className="text-2xl font-bold mb-5">₹0</p>

            <ul className="space-y-2 text-sm text-muted-foreground flex-1">
              <li>✓ Limited daily emails</li>
              <li>✓ 1 SMTP account</li>
              <li>✓ API access</li>
              <li>✓ Basic rate limits</li>
              <li>✓ Email logs</li>
              <li>✓ Template management</li>
              <li>✓ Community support</li>
            </ul>

            <div className="mt-6">
              {plan === "free" ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary text-secondary-foreground border border-btn-border hover:bg-primary/90"
                  onClick={() => handleClick("free")}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>

          {/* PRO */}
          <div className="border border-primary rounded-xl bg-card p-6 ring-1 ring-primary/30 flex flex-col">
            <h2 className="text-lg font-bold mb-1">Pro</h2>
            <p className="text-2xl font-bold mb-2">Coming Soon</p>
            <p className="text-xs text-muted-foreground mb-5">
              Contact our team for early access.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground flex-1">
              <li>✓ Higher daily limits</li>
              <li>✓ Multiple SMTP accounts</li>
              <li>✓ Webhooks</li>
              <li>✓ Priority processing</li>
              <li>✓ Advanced rate limits</li>
              <li>✓ Bulk email access (future)</li>
              <li>✓ Priority support</li>
            </ul>

            <div className="mt-6">
              {plan === "pro" ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full bg-primary text-secondary-foreground border border-btn-border hover:bg-primary/90"
                  onClick={() => handleClick("pro")}
                >
                  Contact Team
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h3 className="text-xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>

          <Accordion type="single" collapsible className="space-y-3">

            <AccordionItem value="1">
              <AccordionTrigger>Do you send emails for me?</AccordionTrigger>
              <AccordionContent>
                No. MailZeno connects to your SMTP provider directly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="2">
              <AccordionTrigger>Are SMTP credentials secure?</AccordionTrigger>
              <AccordionContent>
                Yes. We encrypt them using AES-256-GCM encryption.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="3">
              <AccordionTrigger>Is there email volume markup?</AccordionTrigger>
              <AccordionContent>
                No markup. You control your provider costs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="4">
              <AccordionTrigger>Can I upgrade later?</AccordionTrigger>
              <AccordionContent>
                Yes. Pro will be available soon with higher limits.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="5">
              <AccordionTrigger>Is MailZeno open source?</AccordionTrigger>
              <AccordionContent>
                Core engine and SDK are open source.
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

      </div>
    </section>
  );
}