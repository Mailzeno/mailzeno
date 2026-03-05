"use client";

import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function TemplatesHeader() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold">Templates</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Build and manage reusable email content with our advanced editor
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/dashboard/templates/new")}
        className="inline-flex items-center justify-center gap-2 border border-btn-border bg-primary text-secondry-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:shadow-md w-full sm:w-auto font-medium"
      >
        <Plus size={16} />
        New Template
      </button>
    </motion.div>
  );
}
