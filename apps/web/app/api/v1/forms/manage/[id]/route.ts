import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";
import { parseFormSettings } from "@/lib/services/forms.service";

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: form, error } = await supabase
      .from("forms")
      .select("id, name, slug, schema, settings, is_active, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const nextName = toTrimmedString(body?.name);
    if (!nextName) {
      return NextResponse.json({ error: "Form name required" }, { status: 400 });
    }

    const normalizedSchema = normalizeFormSchema(
      body?.fields ?? body?.schema ?? []
    );

    const rawSettings = body?.settings ?? {};
    const successMessage =
      toTrimmedString(rawSettings?.success_message) ||
      "Thanks! Your response has been submitted.";
    const emailEnabled = Boolean(rawSettings?.email_enabled ?? false);
    const notifyEmail = toTrimmedString(rawSettings?.notify_email);
    const schemaMode = rawSettings?.schema_mode === "flexible" ? "flexible" : "strict";

    const { data: existingForm, error: existingError } = await supabase
      .from("forms")
      .select("settings")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (existingError || !existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const existingSettings = parseFormSettings(existingForm.settings);
    const allowedOrigins = Array.isArray(rawSettings?.allowed_origins)
      ? rawSettings.allowed_origins
          .map((origin: unknown) => toTrimmedString(origin))
          .filter(Boolean)
      : Array.isArray(existingSettings.allowed_origins)
        ? (existingSettings.allowed_origins as unknown[])
            .map((origin) => toTrimmedString(origin))
            .filter(Boolean)
        : [];

    const nextSettings = {
      ...existingSettings,
      success_message: successMessage,
      email_enabled: emailEnabled,
      schema_mode: schemaMode,
      allowed_origins: allowedOrigins,
      ...(notifyEmail || (emailEnabled && user.email)
        ? { notify_email: notifyEmail || user.email }
        : { notify_email: null }),
    };

    const { data: updatedForm, error: updateError } = await supabase
      .from("forms")
      .update({
        name: nextName,
        schema: normalizedSchema,
        settings: nextSettings,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, name, slug, schema, settings")
      .single();

    if (updateError || !updatedForm) {
      return NextResponse.json({ error: "Failed to update form" }, { status: 400 });
    }

    return NextResponse.json({ form: updatedForm });
  } catch {
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    );
  }
}
