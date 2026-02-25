"use client";

import { motion } from "framer-motion";
import PreviewTabs from "@/components/dashboard/PreviewTabs";

type Props = {
  open: boolean;
  onClose: () => void;
  form: any;
};

export default function PreviewModal({ open, onClose, form }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-xl border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold tracking-tight">
            Email Preview
          </h3>

          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition"
            type="button"
          >
            Close
          </button>
        </div>

        <PreviewTabs form={form} />
      </motion.div>
    </div>
  );
}
