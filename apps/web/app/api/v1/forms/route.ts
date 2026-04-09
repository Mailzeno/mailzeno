import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";

function generateShortCode(length = 7) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }

  return result;
}

function slugifyName(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "form"
  );
}

function randomSlugSuffix(length = 4) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }

  return result;
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffixLength = attempt < 4 ? 4 : 6;
    const candidate = `${baseSlug}-${randomSlugSuffix(suffixLength)}`;

    const { data: existing } = await supabase
      .from("forms")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomBytes(6).toString("hex")}`;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Form name required" }, { status: 400 });
    }

    const baseSlug = slugifyName(name);
    const slug = await generateUniqueSlug(supabase, baseSlug);

    const rawSettings = body?.settings ?? {};
    const successMessage =
      typeof rawSettings?.success_message === "string"
        ? rawSettings.success_message
        : typeof rawSettings?.successMessage === "string"
          ? rawSettings.successMessage
          : "Thanks! Your response has been submitted.";

    const emailEnabled = Boolean(
      rawSettings?.email_enabled ?? rawSettings?.notify ?? false
    );

    const notifyEmail =
      typeof rawSettings?.notify_email === "string"
        ? rawSettings.notify_email.trim()
        : "";

    const schemaMode = rawSettings?.schema_mode === "strict" ? "strict" : "flexible";

    const publicApiKey = `fpk_${randomBytes(18).toString("base64url")}`;

    let shortCode = "";
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

    const allowedOrigins = Array.isArray(rawSettings?.allowed_origins)
      ? rawSettings.allowed_origins
          .map((origin: unknown) =>
            typeof origin === "string" ? origin.trim() : ""
          )
          .filter(Boolean)
      : [];

    const settings = {
      success_message: successMessage,
      email_enabled: emailEnabled,
      schema_mode: schemaMode,
      public_api_key: publicApiKey,
      short_code: shortCode,
      allowed_origins: allowedOrigins,
      ...(notifyEmail || (emailEnabled && user.email)
        ? { notify_email: notifyEmail || user.email }
        : {}),
    };

    const normalizedSchema = normalizeFormSchema(
      body?.fields ?? body?.schema ?? []
    );

    const { data: form, error } = await supabase
      .from("forms")
      .insert({
        user_id: user.id,
        name,
        slug,
        schema: normalizedSchema,
        settings,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ form }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("forms")
      .select("id, name, slug, created_at, settings, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const formIds = (data ?? []).map((form) => form.id);
    let submissionsByForm: Record<string, number> = {};

    if (formIds.length > 0) {
      const { data: submissions, error: submissionsError } = await supabase
        .from("form_submissions")
        .select("form_id")
        .in("form_id", formIds);

      if (submissionsError) {
        return NextResponse.json({ error: submissionsError.message }, { status: 400 });
      }

      submissionsByForm = (submissions ?? []).reduce<Record<string, number>>(
        (acc, row) => {
          const key = row.form_id;
          if (!key) return acc;
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        },
        {}
      );
    }

    const forms = (data ?? []).map((form) => ({
      ...form,
      submissions_count: submissionsByForm[form.id] ?? 0,
    }));

    return NextResponse.json({ forms });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Form id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("forms")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const action =
      typeof body?.action === "string" ? body.action.trim() : "";

    if (!id) {
      return NextResponse.json({ error: "Form id required" }, { status: 400 });
    }

    if (action !== "regenerate_public_api_key") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: existingForm, error: fetchError } = await supabase
      .from("forms")
      .select("id, settings")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    let settings: Record<string, unknown> = {};
    if (existingForm.settings && typeof existingForm.settings === "object") {
      settings = existingForm.settings as Record<string, unknown>;
    } else if (typeof existingForm.settings === "string") {
      try {
        const parsed = JSON.parse(existingForm.settings);
        if (parsed && typeof parsed === "object") {
          settings = parsed as Record<string, unknown>;
        }
      } catch {
        settings = {};
      }
    }

    const publicApiKey = `fpk_${randomBytes(18).toString("base64url")}`;

    const nextSettings = {
      ...settings,
      public_api_key: publicApiKey,
    };

    const { error: updateError } = await supabase
      .from("forms")
      .update({ settings: nextSettings })
      .eq("id", existingForm.id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      public_api_key: publicApiKey,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}
