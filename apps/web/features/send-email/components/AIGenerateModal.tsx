"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
};

export default function AIGenerateModal({
  open,
  loading,
  onClose,
  onGenerate,
}: Props) {
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!open) {
      setPrompt("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card w-full max-w-xl rounded-2xl shadow-2xl border flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            ✨ Generate HTML Email
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the email you want to generate..."
            className="w-full border rounded-lg px-3 py-3 text-sm min-h-[160px]"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!prompt || loading}
            onClick={() => onGenerate(prompt)}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
