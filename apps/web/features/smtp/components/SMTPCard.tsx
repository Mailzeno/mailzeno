"use client";

import { motion } from "framer-motion";
import { Power, Trash2, Loader2 } from "lucide-react";
import { resolveLogo } from "../utils/providerResolver";
import { SMTPAccount } from "../hooks/useSMTP";

interface Props {
  smtp: SMTPAccount;
  processingId: string | null;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return name.slice(0, 2) + "***@" + domain;
}

export default function SMTPCard({
  smtp,
  processingId,
  onToggle,
  onDelete,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition"
    >
      {/* LEFT */}
      <div className="flex gap-4">
        <img
          src={resolveLogo(smtp.host)}
          alt="provider"
          className="w-10 h-10"
        />

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{smtp.name}</h2>

            {smtp.is_active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-btn-border/20 text-green-600">
                Default
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {smtp.host}:{smtp.port}
          </p>

          <p className="text-sm text-muted-foreground">
            {maskEmail(smtp.from_email)}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Added {new Date(smtp.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <button
          disabled={processingId === smtp.id}
          onClick={() => onToggle(smtp.id, smtp.is_active)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
            smtp.is_active
              ? "bg-green-500/10 text-green-600 border border-btn-border/20"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {processingId === smtp.id ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Power size={14} />
          )}
          {smtp.is_active ? "Active" : "Set Default"}
        </button>

        <button
          disabled={processingId === smtp.id}
          onClick={() => onDelete(smtp.id)}
          className="px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center gap-2 transition"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </motion.div>
  );
}
