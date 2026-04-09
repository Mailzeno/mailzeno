import { supabaseAdmin } from "@/lib/supabase/admin";

type FormSettings = Record<string, unknown>;
export type FormSchemaMode = "strict" | "flexible";

export function parseFormSettings(input: unknown): FormSettings {
  if (!input) return {};

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  if (typeof input === "object") {
    return input as FormSettings;
  }

  return {};
}

export function resolveFormSchemaMode(settings: unknown): FormSchemaMode {
  const parsed = parseFormSettings(settings);
  return parsed.schema_mode === "flexible" ? "flexible" : "strict";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toFlatLines(
  input: unknown,
  prefix = "",
  acc: string[] = []
): string[] {
  if (Array.isArray(input)) {
    input.forEach((value, index) => {
      const key = prefix ? `${prefix}[${index}]` : `[${index}]`;
      toFlatLines(value, key, acc);
    });
    return acc;
  }

  if (input && typeof input === "object") {
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      toFlatLines(value, nextKey, acc);
    });
    return acc;
  }

  const rendered =
    input === null || input === undefined
      ? ""
      : typeof input === "string"
        ? input
        : String(input);

  acc.push(`${prefix}: ${rendered}`);
  return acc;
}

export function formatSubmissionForEmail(data: unknown) {
  const lines = toFlatLines(data).filter((line) => line.trim() !== ":");

  const text =
    lines.length > 0 ? lines.join("\n") : "No fields were submitted.";

  const htmlRows =
    lines.length > 0
      ? lines
          .map((line) => {
            const separator = line.indexOf(":");
            const key = separator >= 0 ? line.slice(0, separator).trim() : line;
            const value = separator >= 0 ? line.slice(separator + 1).trim() : "";
            return `<tr><td style=\"padding:8px 10px;border:1px solid #e5e7eb;font-weight:600;vertical-align:top;\">${escapeHtml(key)}</td><td style=\"padding:8px 10px;border:1px solid #e5e7eb;\">${escapeHtml(value)}</td></tr>`;
          })
          .join("")
      : `<tr><td style=\"padding:8px 10px;border:1px solid #e5e7eb;\" colspan=\"2\">No fields were submitted.</td></tr>`;

  const html = `<h3 style=\"margin:0 0 12px;\">New Form Submission</h3><table style=\"border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;\"><tbody>${htmlRows}</tbody></table>`;

  return { text, html };
}

export async function getFormBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("id, user_id, name, slug, schema, settings, is_active")
    .eq("slug", slug)
    .single();

  if (error || !data || data.is_active === false) {
    return null;
  }

  return data;
}

export async function getFormByPublicApiKey(publicApiKey: string) {
  const key = publicApiKey.trim();
  if (!key) return null;

  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("id, user_id, name, slug, schema, settings, is_active")
    .eq("is_active", true)
    .contains("settings", { public_api_key: key })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getFormByShortCode(shortCode: string) {
  const code = shortCode.trim();
  if (!code) return null;

  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("id, user_id, name, slug, schema, settings, is_active")
    .eq("is_active", true)
    .contains("settings", { short_code: code })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getFormById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("id, user_id, name, slug, schema, settings, is_active")
    .eq("id", id)
    .single();

  if (error || !data || data.is_active === false) {
    return null;
  }

  return data;
}

export async function createSubmission({
  formId,
  data,
  ip,
  userAgent,
}: {
  formId: string;
  data: any;
  ip: string | null;
  userAgent: string | null;
}) {
  const { error } = await supabaseAdmin.from("form_submissions").insert({
    form_id: formId,
    data,
    ip,
    user_agent: userAgent,
  });

  if (error) {
    throw new Error("DB_INSERT_FAILED");
  }

  return true;
}
