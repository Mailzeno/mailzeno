import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";
import { parseFormSettings } from "@/lib/services/forms.service";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { FormIntegrationActions } from "@/components/forms/form-integration-actions";

function generateShortCode(length = 7) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }

  return result;
}

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: form, error } = await supabase
    .from("forms")
    .select("id, name, slug, schema, settings, created_at, is_active")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !form) {
    return notFound();
  }

  const schema = normalizeFormSchema(form.schema);
  const settings = parseFormSettings(form.settings ?? {});

  let shortCode =
    typeof settings?.short_code === "string" && settings.short_code
      ? settings.short_code
      : "";

  if (!shortCode) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = generateShortCode(7);
      const { data: existing } = await supabase
        .from("forms")
        .select("id")
        .contains("settings", { short_code: candidate })
        .limit(1)
        .maybeSingle();

      if (!existing) {
        shortCode = candidate;
        break;
      }
    }

    if (!shortCode) {
      shortCode = generateShortCode(9);
    }

    const nextSettings = {
      ...settings,
      short_code: shortCode,
    };

    await supabase
      .from("forms")
      .update({ settings: nextSettings })
      .eq("id", form.id)
      .eq("user_id", user.id);
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://mailzeno.dev"
  ).replace(/\/$/, "");

  const successMessage =
    typeof settings?.success_message === "string" && settings.success_message
      ? settings.success_message
      : "Thanks! Your response has been submitted.";

  const notificationsEnabled = settings?.email_enabled !== false;
  const notifyEmail =
    typeof settings?.notify_email === "string" && settings.notify_email
      ? settings.notify_email
      : "Uses account email";

  const publicApiKey =
    typeof settings?.public_api_key === "string" && settings.public_api_key
      ? settings.public_api_key
      : "Not generated";

  const allowedOrigins = Array.isArray(settings?.allowed_origins)
    ? settings.allowed_origins
        .map((origin) => (typeof origin === "string" ? origin.trim() : ""))
        .filter(Boolean)
    : [];
  const schemaMode =
    settings?.schema_mode === "strict" ? "strict" : "flexible";

  const embedScript = `${appUrl}/api/v1/forms/embed/${form.slug}`;
  const sdkScriptBase =
    process.env.NEXT_PUBLIC_FORMS_SDK_CDN_URL || `${appUrl}/mz.forms.js`;
  const sdkScript = `${sdkScriptBase}${sdkScriptBase.includes("?") ? "&" : "?"}v=2.2.0`;

  const embedSnippet = `<div data-mailzeno-form="${form.slug}" data-height="680px"></div>\n<script src="${embedScript}" async></script>`;
  const autoSubmitSnippet = `<script src="${sdkScript}" defer></script>\n\n<form\n  data-mz-form-slug="${form.slug}"\n  data-mz-public-key="${publicApiKey}"\n  data-mz-success-message="Thanks. We received your request."\n>\n  <input name="name" placeholder="Name" required />\n  <input name="email" type="email" placeholder="Email" required />\n  <!-- add custom fields here (saved by input name in flexible mode) --> \n  <button type="submit" data-loading-text="Submitting...">Submit</button>\n</form>\n\n<p data-mz-success hidden></p>\n<p data-mz-error hidden></p>`;
  const statusLabel = form.is_active === false ? "Inactive" : "Active";

  return (
    <div className="sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto w-full space-y-6">
      <BackButton className="pb-2" />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">{form.name}</h1>
        <p className="text-sm text-muted-foreground">
          Status:{" "}
          <span className="font-medium text-foreground">{statusLabel}</span>
        </p>
        <div className="pt-1">
          <Link href={`/dashboard/forms/${form.id}/edit`}>
            <Button size="sm" variant="outline">
              Edit Form
            </Button>
          </Link>
        </div>
      </div>

      <div className="border border-border/60 rounded-2xl p-5 space-y-4 bg-background">
        <div>
          <p className="text-sm font-medium">Public URL</p>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <code className="px-3 py-2 rounded-lg bg-muted text-sm">
              {`${appUrl}/f/${form.slug}`}
            </code>
            <Link
              href={`${appUrl}/f/${form.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="secondary" size="sm">
                Open Form
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Short Share URL</p>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <code className="px-3 py-2 rounded-lg bg-muted text-sm">
              {shortCode
                ? `${appUrl}/s/${shortCode}`
                : "Not generated for this form"}
            </code>
            {shortCode ? (
              <Link
                href={`${appUrl}/s/${shortCode}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" size="sm">
                  Open Short URL
                </Button>
              </Link>
            ) : null}
          </div>
          {!shortCode ? (
            <p className="text-xs text-muted-foreground mt-2">
              New forms get short links automatically.
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium">Success Message</p>
          <p className="text-sm text-muted-foreground mt-1">{successMessage}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Notification Email</p>
          <p className="text-sm text-muted-foreground mt-1">
            {notificationsEnabled ? notifyEmail : "Notifications are disabled"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Public API Key</p>
          <p className="text-sm text-muted-foreground mt-1 break-all">
            {publicApiKey}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Allowed Origins</p>
          <p className="text-sm text-muted-foreground mt-1">
            {allowedOrigins.length > 0
              ? allowedOrigins.join(", ")
              : "All origins are currently allowed"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Schema Mode</p>
          <p className="text-sm text-muted-foreground mt-1">
            {schemaMode === "strict"
              ? "Strict (unknown fields blocked)"
              : "Flexible (unknown fields stored as top-level keys)"}
          </p>
        </div>
      </div>

      <div className="border border-border/60 rounded-2xl p-5 bg-background space-y-5">
        <h2 className="text-sm font-medium">Developer Integration</h2>

        <FormIntegrationActions
          formId={form.id}
          publicApiKey={publicApiKey}
          snippets={{
            embed: embedSnippet,
            autoSubmit: autoSubmitSnippet,
          }}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">1) Hosted Embed (Zero Code)</p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-muted px-3 py-3 text-muted-foreground border border-border/60">
            {embedSnippet}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            2) Script + Form Key (Recommended)
          </p>
          <pre className="text-xs overflow-x-auto rounded-lg bg-muted px-3 py-3 text-muted-foreground border border-border/60">
            {autoSubmitSnippet}
          </pre>
          <p className="text-xs text-muted-foreground">
            Recommended: use slug based submit (data-mz-form-slug). Public key
            fallback supported.
          </p>
        </div>
      </div>

      <div className="border border-border/60 rounded-2xl p-5 bg-background">
        <h2 className="text-sm font-medium mb-3">Fields</h2>
        {schema.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fields configured.</p>
        ) : (
          <ul className="space-y-2">
            {schema.fields.map((field) => (
              <li
                key={field.name}
                className="flex items-center justify-between text-sm border border-border/60 rounded-lg px-3 py-2"
              >
                <span>{field.label}</span>
                <span className="text-xs text-muted-foreground">
                  {field.type || "text"}
                  {field.required ? " • required" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
