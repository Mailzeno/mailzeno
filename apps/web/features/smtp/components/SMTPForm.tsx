"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SMTP_PROVIDERS } from "../config/providers";
import { useToast } from "@/components/ui/use-toast";
import { Shield } from "lucide-react";
import {Button} from "@/components/ui/button"

interface Props {
  provider: string;
}

export default function SMTPForm({ provider }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const config = SMTP_PROVIDERS.find((p) => p.id === provider);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name"),
      host: provider === "custom" ? form.get("host") : config?.host,
      port: provider === "custom" ? form.get("port") : config?.port,
      username: form.get("username"),
      password: form.get("password"),
      from_email: form.get("from_email"),
      from_name: form.get("from_name"),
      secure: config?.secure ?? true,
    };

    try {
      const res = await fetch("/api/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to connect SMTP");
      }

      toast({ title: "SMTP connected successfully 🚀" });

      router.push("/dashboard/smtp");
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border rounded-xl p-6 md:p-8 space-y-6"
    >
      <FormField label="Account Name">
        <input name="name" required className="smtp-input" />
      </FormField>

      {provider === "custom" && (
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="SMTP Host">
            <input name="host" required className="smtp-input" />
          </FormField>

          <FormField label="Port">
            <input name="port" required className="smtp-input" />
          </FormField>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="User Email">
          <input name="username" required className="smtp-input" />
        </FormField>

        <FormField label="App Password">
          <input type="password" name="password" required className="smtp-input" />
        </FormField>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="From Email">
          <input name="from_email" required className="smtp-input" />
        </FormField>

        <FormField label="From Name">
          <input name="from_name" required className="smtp-input" />
        </FormField>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/10 px-3 py-2 rounded-lg">
        <Shield size={14} />
        Credentials are encrypted using AES-256 before storing.
      </div>

      <Button
        variant={"main"}
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 rounded-md bg-primary text-secondary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect SMTP"}
      </Button>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
