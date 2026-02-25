"use client";

import { motion } from "framer-motion";
import { Mail, Check, MousePointer2, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/* ---------------- Looping Check Flow ---------------- */

function CheckFlow() {
  const steps = 4;
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % (steps + 1));
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-10 sm:mt-16 flex items-center justify-center ">
      <div className="relative flex items-center">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            {/* Check circle */}
            <motion.div
              animate={{
                scale: active > i ? 1 : 0.85,
                opacity: active > i ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-secondary-foreground shadow"
            >
              {active > i ? (
                <Check className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary-foreground/60" />
              )}
            </motion.div>

            {/* Connector */}
            {i !== 3 && (
              <motion.div
                animate={{
                  width: active > i + 1 ? 36 : 10,
                  opacity: active > i ? 1 : 0.3,
                }}
                transition={{ duration: 0.3 }}
                className="mx-1 sm:mx-2 h-0.5 border-t-2 border-dashed border-primary"
              />
            )}
          </div>
        ))}

        {/* Moving loader */}
        <motion.div
          animate={{
            x: active * (isMobile ? 55 : 78),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="absolute top-13 hidden md:block flex items-center justify-center"
        >
          <MousePointer2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary drop-shadow-xl" />
          <div className="w-full px-2 border-btn-border border rounded-full relative -right-10 flex justify-center items-center gap-2 py-2">
            <div className="bg-primary w-2 h-2 rounded-full animate-pulse"></div>
            <div className="bg-primary w-2 h-2 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="bg-primary w-2 h-2 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- Main Component ---------------- */

export function FeatureDuo() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid gap-6 md:grid-cols-2 z-10">
        {/* LEFT CARD */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-10"
        >
          <div className="mb-3 text-[10px] sm:text-xs font-semibold tracking-widest text-primary">
            SMTP & API
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Send emails with your own SMTP
          </h3>

          <p className="mt-3 sm:mt-4 max-w-md text-sm sm:text-base text-muted-foreground">
            Connect Gmail, Zoho, Outlook, or any custom SMTP. Send transactional
            emails from a clean dashboard.
          </p>

          {/* Email preview illustration */}
          <div className="mt-8 sm:mt-12 relative">
            <div className="relative rounded-xl sm:rounded-2xl border border-dashed border-btn-border/30 border-2 bg-background p-4 sm:p-5 shadow-sm">
              <div className="mb-3 sm:mb-4 flex items-center gap-2">
                <div className="h-2 w-10 rounded bg-primary/40" />
                <div className="h-2 w-6 rounded bg-primary/40" />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>

              <div className="mt-5 sm:mt-6 flex justify-center">
                <button className="rounded-md border bg-card px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-medium shadow-sm">
                  <MousePointer2 className="mr-1 inline h-3 w-3" />
                  Send Email
                </button>
              </div>
            </div>

            {/* floating mail icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-3 sm:-left-6 top-0 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          </div>

          {/* grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-100
  [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),
  linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]
  [background-size:28px_28px]"
          />
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-10"
        >
          <div className="mb-3 text-[10px] sm:text-xs font-semibold tracking-widest text-primary">
            TEMPLATES
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Reusable email templates
          </h3>

          <p className="mt-3 sm:mt-4 max-w-md text-sm sm:text-base text-muted-foreground">
            Create, edit, and reuse templates for OTPs, invoices, and alerts
            across every workflow.
          </p>

          <CheckFlow />

          <div
            className="pointer-events-none absolute inset-0 opacity-50
  [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),
  linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]
  [background-size:32px_32px]"
          />
        </motion.div>
      </div>
    </section>
  );
}
