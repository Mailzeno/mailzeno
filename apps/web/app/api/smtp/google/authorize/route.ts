import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getAppUrl(req: NextRequest): string {
  const requestOrigin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) {
    const trimmed = fromEnv.trim().replace(/\/$/, "");
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    if (/^localhost(?::\d+)?$/i.test(trimmed)) {
      return `http://${trimmed}`;
    }

    return `https://${trimmed}`;
  }

  return requestOrigin;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.GOOGLE_SMTP_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=google_oauth_not_configured", req.url),
    );
  }

  const name = (req.nextUrl.searchParams.get("name") || "").trim();
  const fromName = (req.nextUrl.searchParams.get("from_name") || "").trim();

  if (!name || !fromName) {
    return NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=missing_fields", req.url),
    );
  }

  const state = crypto.randomBytes(24).toString("hex");
  const codeVerifier = crypto.randomBytes(48).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  cookieStore.set(
    "smtp_google_oauth",
    JSON.stringify({
      state,
      codeVerifier,
      userId: user.id,
      name,
      fromName,
      createdAt: Date.now(),
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/smtp/google",
      maxAge: 10 * 60,
    },
  );

  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}/api/smtp/google/callback`;

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set(
    "scope",
    "openid email https://www.googleapis.com/auth/gmail.send",
  );
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "consent");
  googleUrl.searchParams.set("include_granted_scopes", "true");
  googleUrl.searchParams.set("code_challenge", codeChallenge);
  googleUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(googleUrl);
}
