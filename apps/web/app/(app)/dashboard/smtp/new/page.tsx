"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { motion } from "framer-motion";
import ProviderSelector from "@/features/smtp/components/ProviderSelector";
import SMTPForm from "@/features/smtp/components/SMTPForm";
import { useSearchParams } from "next/navigation";

export default function NewSMTPPage() {
  const searchParams = useSearchParams();
  const initialProvider = searchParams.get("provider") || "custom";
  const [provider, setProvider] = useState(initialProvider);

  return (
    <div className="px-4 md:px-8 py-6">
      <BackButton className="pb-10" />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">Add SMTP Account</h1>
          <p className="text-sm text-muted-foreground">
            Connect your provider to start sending emails securely.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <ProviderSelector selected={provider} onSelect={setProvider} />

          <SMTPForm provider={provider} />
        </div>
      </motion.div>
    </div>
  );
}

