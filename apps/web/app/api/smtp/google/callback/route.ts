import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createEncryptionService } from "@/lib/encryption";

export const runtime = "nodejs";

type OAuthCookiePayload = {
  state: string;
  codeVerifier: string;
  userId: string;
  name: string;
  fromName: string;
  createdAt: number;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

type GoogleUserInfo = {
  email?: string;
};

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

function cleanupOAuthCookie() {
  return {
    name: "smtp_google_oauth",
    value: "",
    options: {
      path: "/api/smtp/google",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0,
    },
  };
}

function parseOAuthCookie(raw: string | undefined): OAuthCookiePayload | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OAuthCookiePayload;
    if (
      !parsed?.state ||
      !parsed?.codeVerifier ||
      !parsed?.userId ||
      !parsed?.name ||
      !parsed?.fromName ||
      typeof parsed?.createdAt !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const cleanupCookie = cleanupOAuthCookie();

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthCookie = parseOAuthCookie(cookieStore.get("smtp_google_oauth")?.value);

  if (!code || !state || !oauthCookie) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=oauth_invalid_request", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  if (state !== oauthCookie.state || Date.now() - oauthCookie.createdAt > 10 * 60 * 1000) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=oauth_state_mismatch", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const clientId = process.env.GOOGLE_SMTP_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SMTP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=google_oauth_not_configured", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const appUrl = getAppUrl(req);
  const redirectUri = `${appUrl}/api/smtp/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: oauthCookie.codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=token_exchange_failed", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  if (!tokenData.access_token || !tokenData.refresh_token) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=missing_refresh_token", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!profileRes.ok) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=userinfo_failed", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const profile = (await profileRes.json()) as GoogleUserInfo;
  const email = profile.email?.trim().toLowerCase();

  if (!email) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=email_missing", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== oauthCookie.userId) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const encryption = createEncryptionService();

  const secretPayload = JSON.stringify({
    type: "google_oauth",
    refreshToken: tokenData.refresh_token,
    createdAt: new Date().toISOString(),
  });

  const encryptedSecret = encryption.encrypt(secretPayload);

  const { count } = await supabase
    .from("smtp_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isDefault = count === 0;

  const { error: insertError } = await supabase.from("smtp_accounts").insert({
    user_id: user.id,
    name: oauthCookie.name,
    host: "smtp.gmail.com",
    port: 465,
    username: email,
    password_encrypted: encryptedSecret,
    from_email: email,
    from_name: oauthCookie.fromName,
    secure: true,
    is_active: true,
    is_default: isDefault,
  });

  if (insertError) {
    const res = NextResponse.redirect(
      new URL("/dashboard/smtp/new?provider=gmail&error=smtp_create_failed", req.url),
    );
    res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
    return res;
  }

  const res = NextResponse.redirect(new URL("/dashboard/smtp", req.url));
  res.cookies.set(cleanupCookie.name, cleanupCookie.value, cleanupCookie.options);
  return res;
}
