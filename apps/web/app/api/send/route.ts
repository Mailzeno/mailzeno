import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmailService } from "@/lib/services/email.service";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const supabase = await createClient();

  //  Authenticate user from Supabase session

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "unauthorized" },
        { status: 401, headers: { "x-request-id": requestId } }
      );
    }

    // Fetch user profile to determine plan for rate limiting

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found", code: "profile_not_found" },
        { status: 500, headers: { "x-request-id": requestId } }
      );
    }

    const plan = profile.plan === "pro" ? "pro" : "free";

    // Rate limiting based on user ID and plan

    const rate = await checkRateLimit(user.id, plan, "user");

    const rateHeaders: Record<string, string> = {
      "x-request-id": requestId,
      "x-ratelimit-limit": String(rate.limit),
      "x-ratelimit-remaining": String(rate.remaining),
      "x-ratelimit-reset": String(rate.reset),
      "x-response-time": `${Date.now() - startTime}ms`,
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
        }
      );
    }

  // Parse and validate request body

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "invalid_json" },
        { status: 400, headers: rateHeaders }
      );
    }

    const { smtpId, to, subject, html, text } = body;

    if (!smtpId || !to || !subject) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "missing_required_fields",
        },
        { status: 400, headers: rateHeaders }
      );
    }

    //  Deliver email using service

    const result = await sendEmailService({
      userId: user.id,
      smtpId,
      from: user.email!, // trusted from session
      to,
      subject,
      html,
      text,
      plan,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to send email",
          code: "email_send_failed",
        },
        { status: 500, headers: rateHeaders }
      );
    }

    // Successful response with message ID and rate limit headers

    return NextResponse.json(
      {
        success: true,
        messageId: result.data?.messageId,
      },
      { headers: rateHeaders }
    );

  } catch (error) {
    console.error("[Dashboard Send Error]", error);

    return NextResponse.json(
      { error: "Internal Server Error", code: "internal_server_error" },
      { status: 500, headers: { "x-request-id": crypto.randomUUID() } }
    );
  }
}
