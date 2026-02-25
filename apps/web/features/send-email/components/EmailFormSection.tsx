"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SMTP = {
  id: string;
  name: string;
  is_active: boolean;
};

type Props = {
  smtpList: SMTP[];
  selectedSMTP: string;
  setSelectedSMTP: (v: string) => void;
  form: {
    to: string;
    cc: string;
    bcc: string;
    subject: string;
  };
  setForm: (fn: any) => void;
  errors: any;
  setErrors: (fn: any) => void;
};

export default function EmailFormSection({
  smtpList,
  selectedSMTP,
  setSelectedSMTP,
  form,
  setForm,
  errors,
  setErrors,
}: Props) {
  const [showCcBcc, setShowCcBcc] = useState(false);

  return (
    <div className="border rounded-xl p-6 space-y-6 bg-card shadow-sm">
      {/* SMTP */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          SMTP Account <span className="text-red-500">*</span>
        </label>

        <Select
          value={selectedSMTP}
          onValueChange={(value) => {
            setSelectedSMTP(value);
            setErrors((prev: any) => ({ ...prev, smtp: undefined }));
          }}
        >
          <SelectTrigger
            className={`w-full max-w-sm ${
              errors.smtp ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Select SMTP account" />
          </SelectTrigger>

          <SelectContent>
            {smtpList.length === 0 && (
              <SelectItem value="none" disabled>
                No SMTP accounts found
              </SelectItem>
            )}

            {smtpList.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{s.name}</span>
                  {s.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full border border-border ml-2">
                      Default
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.smtp && (
          <p className="text-xs text-red-500">{errors.smtp}</p>
        )}
      </div>

      {/* Recipients */}
      <div className="space-y-3">
        <Input
          label="To"
          value={form.to}
          placeholder="recipient@example.com"
          onChange={(v) => {
            setForm((prev: any) => ({ ...prev, to: v }));
            setErrors((prev: any) => ({ ...prev, to: undefined }));
          }}
          error={errors.to}
          required
        />

        {!showCcBcc && (
          <button
            type="button"
            onClick={() => setShowCcBcc(true)}
            className="text-xs border-border border px-3 py-1.5 rounded-md text-primary hover:bg-muted transition"
          >
            + Add CC / BCC
          </button>
        )}

        <AnimatePresence initial={false}>
          {showCcBcc && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <Input
                  label="CC"
                  value={form.cc}
                  placeholder="manager@example.com"
                  onChange={(v) =>
                    setForm((prev: any) => ({ ...prev, cc: v }))
                  }
                />
                <Input
                  label="BCC"
                  value={form.bcc}
                  placeholder="audit@example.com"
                  onChange={(v) =>
                    setForm((prev: any) => ({ ...prev, bcc: v }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCcBcc(false)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition"
              >
                Hide CC / BCC
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subject */}
      <Input
        label="Subject"
        placeholder="Email subject line"
        value={form.subject}
        onChange={(v) => {
          setForm((prev: any) => ({ ...prev, subject: v }));
          setErrors((prev: any) => ({ ...prev, subject: undefined }));
        }}
        error={errors.subject}
        required
      />
    </div>
  );
}

/* Input Component */
function Input({
  placeholder,
  label,
  value,
  onChange,
  error,
  required = false,
}: {
  placeholder: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          error ? "border-red-500 ring-1 ring-red-500/20" : ""
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
