"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SMTP_PROVIDERS } from "../config/providers";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegionSelect } from "./RegionSelect";

interface Props {
  provider: string;
}

export default function SMTPForm({ provider }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState("ap-south-1");
  const [username, setUsername] = useState("");
  const isGmail = provider === "gmail";

  const config = SMTP_PROVIDERS.find((p) => p.id === provider);

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) {
      return;
    }

    const errorMessages: Record<string, string> = {
      missing_fields: "Please fill account name and from name before continuing.",
      google_oauth_not_configured:
        "Google OAuth credentials are not configured on the server.",
      oauth_invalid_request: "Google OAuth request is invalid. Please try again.",
      oauth_state_mismatch: "OAuth state validation failed. Please try again.",
      token_exchange_failed: "Failed to complete Google token exchange.",
      missing_refresh_token:
        "Google did not return a refresh token. Re-authorize with consent.",
      userinfo_failed: "Failed to fetch your Google account details.",
      email_missing: "Google account email could not be resolved.",
      smtp_create_failed: "Failed to save Gmail SMTP account.",
    };

    toast({
      title: "Google connection failed",
      description: errorMessages[error] || "Unable to connect Gmail. Please try again.",
      variant: "destructive",
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `?${nextQuery}` : "?");
  }, [searchParams, toast, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const accountName = String(form.get("name") || "").trim();
    const fromName = String(form.get("from_name") || "").trim();

    if (!accountName || !fromName) {
      toast({
        title: "Missing required fields",
        description: "Please provide account name and from name.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (isGmail) {
      const params = new URLSearchParams({
        name: accountName,
        from_name: fromName,
      });

      window.location.href = `/api/smtp/google/authorize?${params.toString()}`;
      return;
    }

    const body = {
      name: accountName,
      host:
        provider === "custom"
          ? form.get("host")
          : provider === "ses"
            ? `email-smtp.${region}.amazonaws.com`
            : config?.host,

      port: provider === "custom" ? Number(form.get("port")) : config?.port,
      username: form.get("username"),
      password: form.get("password"),
      from_email: form.get("username"),
      from_name: fromName,
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

      {provider === "ses" && (
        <FormField label="AWS Region">
          <RegionSelect value={region} onChange={setRegion} />
        </FormField>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="User Email">
          <input
            name="username"
            required={!isGmail}
            disabled={isGmail}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`smtp-input ${isGmail ? "opacity-60 cursor-not-allowed" : ""}`}
            placeholder={isGmail ? "Will be fetched from Google" : ""}
          />
        </FormField>

        {isGmail ? (
          <FormField label="Google OAuth (Send-only)">
            <div className="smtp-input flex items-center text-sm text-muted-foreground">
              Click Continue with Google to authorize Gmail send-only access.
            </div>
          </FormField>
        ) : (
          <FormField label="App Password">
            <input
              type="password"
              name="password"
              required
              className="smtp-input"
            />
          </FormField>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField label="From Email">
          <input
            value={username}
            disabled
            className="smtp-input opacity-60 cursor-not-allowed"
          />
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
        {loading ? "Connecting..." : isGmail ? "Continue with Google" : "Connect SMTP"}
      </Button>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
