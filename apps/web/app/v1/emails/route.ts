import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmailService } from "@/lib/services/email.service";
import { hashApiKey } from "@/lib/security/api-key";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";


export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    //  Auth Check

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid API key", code: "invalid_auth_header" },
        { status: 401, headers: { "x-request-id": requestId } },
      );
    }

    const rawKey = authHeader.slice(7).trim();
    const hashedKey = hashApiKey(rawKey);

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id")
      .eq("key_hash", hashedKey)
      .eq("is_active", true)
      .single();

      

    if (!keyData) {
      return NextResponse.json(
        { error: "Invalid or inactive API key", code: "invalid_api_key" },
        { status: 401, headers: { "x-request-id": requestId } },
      );
    }

    // Plan

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", keyData.user_id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found", code: "profile_not_found" },
        { status: 500, headers: { "x-request-id": requestId } },
      );
    }

    const plan = profile.plan === "pro" ? "pro" : "free";

    //  Rate Limit

    const rate = await checkRateLimit(keyData.id, plan, "api");

    const rateHeaders: Record<string, string> = {
      "x-request-id": requestId,
      "x-ratelimit-limit": String(rate.limit),
      "x-ratelimit-remaining": String(rate.remaining),
      "x-ratelimit-reset": String(rate.reset),
    };

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          code: "rate_limit_exceeded",
        },
        {
          status: 429,
          headers: {
            ...rateHeaders,
            "retry-after": String(rate.retryAfter ?? 60),
          },
        },
      );
    }

    // Body

    const body = await req.json();

    const {
      smtpId,
      from,
      to,
      subject,
      html,
      text,
      templateId,
      templateKey,
      variables,
    } = body;

    if (!smtpId || !from || !to) {
      return NextResponse.json(
        { error: "Missing required fields", code: "missing_required_fields" },
        { status: 400, headers: rateHeaders },
      );
    }

    if (!templateId && !templateKey && (!subject || !html)) {
      return NextResponse.json(
        {
          error: "Missing email content",
          code: "missing_email_content",
        },
        { status: 400, headers: rateHeaders },
      );
    }

    // Send Infra

    const result = await sendEmailService({
      userId: keyData.user_id,
      smtpId,
      from,
      to,
      subject,
      html,
      text,
      templateId,
      templateKey,
      variables,
      plan,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to send email",
          code: "email_send_failed",
        },
        { status: 500, headers: rateHeaders },
      );
    }

  //  Update Last Used*

    void supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyData.id);

    //  SUCCESS 

    return NextResponse.json(
      { success: true, messageId: result.data?.messageId },
      { headers: rateHeaders },
    );
  } catch (error) {
    console.error("[MailZeno API Error]", error);

    return NextResponse.json(
      { error: "Internal Server Error", code: "internal_server_error" },
      { status: 500, headers: { "x-request-id": crypto.randomUUID() } },
    );
  }
}
