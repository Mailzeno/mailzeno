import { success, fail } from "@/lib/utils/api-response";
import { getFormBySlug, createSubmission } from "@/lib/services/forms.service";
import { parseFormSettings } from "@/lib/services/forms.service";
import { formatSubmissionForEmail } from "@/lib/services/forms.service";
import { resolveFormSchemaMode } from "@/lib/services/forms.service";
import { validateForm } from "@/lib/validators/forms.validator";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmailService } from "@/lib/services/email.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_FIELD_VALUE_LENGTH = 5000;
const MAX_MULTI_VALUE_ITEMS = 100;

function normalizeOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return "";
  }
}

function resolveAllowedOrigin(req: Request, allowedOrigins: string[]) {
  const origin = req.headers.get("origin");

  const normalizedAllowedOrigins = allowedOrigins
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);

  if (!origin) return "*";
  if (normalizedAllowedOrigins.length === 0) return origin;

  const normalizedRequestOrigin = normalizeOrigin(origin);
  if (normalizedRequestOrigin && normalizedAllowedOrigins.includes(normalizedRequestOrigin)) {
    return origin;
  }

  return "";
}

function buildCorsHeaders(req: Request, allowedOrigins: string[]) {
  const allowOrigin = resolveAllowedOrigin(req, allowedOrigins);

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Form-Public-Key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  } as Record<string, string>;
}

function getRateLimitHeaders(rate: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}) {
  return {
    "X-RateLimit-Limit": String(Math.max(0, rate.limit)),
    "X-RateLimit-Remaining": String(Math.max(0, rate.remaining)),
    "X-RateLimit-Reset": String(Math.max(0, rate.reset)),
    ...(typeof rate.retryAfter === "number" && rate.retryAfter > 0
      ? { "Retry-After": String(Math.floor(rate.retryAfter)) }
      : {}),
  };
}

function normalizeSubmissionValue(value: unknown): string | string[] | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .filter((entry) => entry !== undefined && entry !== null)
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .slice(0, MAX_MULTI_VALUE_ITEMS)
      .map((entry) => entry.slice(0, MAX_FIELD_VALUE_LENGTH));

    return normalized.length > 0 ? normalized : undefined;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "object") {
    return undefined;
  }

  const normalized = String(value).trim().slice(0, MAX_FIELD_VALUE_LENGTH);
  return normalized ? normalized : undefined;
}

function sanitizePayload(
  rawPayload: Record<string, unknown>,
  allowedFieldNames: Set<string>
) {
  const sanitized: Record<string, string | string[]> = {};
  const extra: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(rawPayload)) {
    if (
      !key ||
      key === "__proto__" ||
      key === "prototype" ||
      key === "constructor"
    ) {
      continue;
    }

    const normalizedValue = normalizeSubmissionValue(value);
    if (normalizedValue === undefined) {
      continue;
    }

    if (allowedFieldNames.has(key)) {
      sanitized[key] = normalizedValue;
      continue;
    }

    extra[key] = normalizedValue;
  }

  return { sanitized, extra };
}

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(req, []),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const contentLengthHeader = req.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return fail("Payload too large", "payload_too_large", 413);
      }
    }

    // Parse request body (JSON or form-encoded)
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, any> | null = null;

    if (
      contentType.includes("application/json") ||
      contentType.includes("text/plain") ||
      contentType === ""
    ) {
      try {
        body = await req.json();
      } catch {
        return fail("Invalid JSON body", "invalid_json", 400);
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          body[key] = value;
        }
      }
    } else {
      return fail("Unsupported content type", "unsupported_content_type", 415);
    }

    if (!body || typeof body !== "object") {
      return fail("Invalid request body", "invalid_body", 400);
    }

    // Fetch form by slug
    let form = await getFormBySlug(slug);
    if (!form) {
      return fail("Form not found", "form_not_found", 404);
    }

    const settings = parseFormSettings(form.settings);
    const allowedOrigins = Array.isArray(settings.allowed_origins)
      ? settings.allowed_origins
          .map((origin: unknown) =>
            typeof origin === "string" ? origin.trim() : ""
          )
          .filter(Boolean)
      : [];
    const corsHeaders = buildCorsHeaders(req, allowedOrigins);

    if (!corsHeaders["Access-Control-Allow-Origin"]) {
      return fail("Origin not allowed", "origin_not_allowed", 403, corsHeaders);
    }

    const providedPublicKey =
      req.headers.get("x-form-public-key") || body.public_api_key;
    const expectedPublicKey =
      typeof settings.public_api_key === "string" ? settings.public_api_key : "";

    if (providedPublicKey && expectedPublicKey && providedPublicKey !== expectedPublicKey) {
      return fail("Invalid public API key", "invalid_public_api_key", 401, corsHeaders);
    }

    // Basic honeypot spam protection
    if (body.company) {
      return fail("Spam detected", "spam_detected", 400, corsHeaders);
    }

    const normalizedSchema = normalizeFormSchema(form.schema);
    const fields = normalizedSchema.fields;
    const schemaMode = resolveFormSchemaMode(settings);
    const allowedFieldNames = new Set(
      fields
        .map((field) => (typeof field.name === "string" ? field.name.trim() : ""))
        .filter(Boolean)
    );
    allowedFieldNames.add("company");
    const { sanitized, extra } = sanitizePayload(body, allowedFieldNames);

    if (schemaMode === "strict") {
      const unknownFieldKeys = Object.keys(extra);
      if (unknownFieldKeys.length > 0) {
        return fail(
          `Unknown field: ${unknownFieldKeys[0]}`,
          "unknown_field",
          400,
          corsHeaders
        );
      }
    }

    // Validate form fields
    const validationError = validateForm(fields, sanitized);
    if (validationError) {
      return fail(validationError, "validation_error", 400, corsHeaders);
    }

    const submissionData: Record<string, unknown> = { ...sanitized };
    if (schemaMode === "flexible" && Object.keys(extra).length > 0) {
      Object.assign(submissionData, extra);
    }

    // Extract client metadata
    const ip = getClientIp(req);

    const userAgent = req.headers.get("user-agent") || "unknown";

    // Get user plan (required for rate limiting + email service)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", form.user_id)
      .single();

    const plan = profile?.plan === "pro" ? "pro" : "free";

    // Apply rate limiting (per form + IP)
    const rate = await checkRateLimit(
      `form:${form.id}:${ip}`,
      plan,
      "form"
    );
    const rateHeaders = getRateLimitHeaders(rate);

    if (!rate.allowed) {
      return fail(
        "Too many requests",
        "rate_limited",
        429,
        { ...corsHeaders, ...rateHeaders }
      );
    }

    // Save submission to database
    await createSubmission({
      formId: form.id,
      data: submissionData,
      ip,
      userAgent,
    });

    // Send notification email (non-blocking safe)
    if (settings?.notify_email && settings?.email_enabled) {
      try {
        const emailContent = formatSubmissionForEmail(submissionData);

        await sendEmailService({
          userId: form.user_id,

          // Required fields for email service
          from: String(settings.notify_email),
          to: String(settings.notify_email),

          subject: `New submission: ${form.name}`,
          html: emailContent.html,
          text: emailContent.text,

          plan,

          // Optional SMTP override
          smtpId:
            typeof settings?.smtp_id === "string"
              ? settings.smtp_id
              : undefined,
        });
      } catch (err) {
        console.error("EMAIL_FAILED", err);
        // Do not fail request if email fails
      }
    }

    // Success response
    return success(
      { message: "Submitted successfully" },
      200,
      { ...corsHeaders, ...rateHeaders }
    );

  } catch (err) {
    console.error("FORM_SUBMIT_ERROR", err);
    return fail("Internal server error", "internal_error", 500);
  }
}
