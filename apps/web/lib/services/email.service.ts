import { sendEmail, SMTPConfig } from "@mailzeno/core";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createEncryptionService } from "@/lib/encryption";
import { PLAN_CONFIG } from "@/lib/plans";

interface SendEmailInput {
  userId: string;
  smtpId?: string;
  from: string;
  to: string | string[];
  subject?: string;
  plan: "free" | "pro";
  html?: string;
  text?: string;
  templateId?: string;
  templateKey?: string;
  variables?: Record<string, string>;
}

const MAX_HTML_SIZE = PLAN_CONFIG.pro.maxHtmlSize;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type GoogleOAuthSecret = {
  type: "google_oauth";
  refreshToken: string;
  createdAt: string;
};

// Utility functions and validations

function validateRecipients(to: string | string[]) {
  const emails = Array.isArray(to) ? to : [to];

  for (const email of emails) {
    if (!emailRegex.test(email)) {
      throw new Error("Invalid recipient email");
    }
  }
}

function renderTemplate(
  content: string,
  variables: Record<string, string> = {},
) {
  return content.replace(/{{(.*?)}}/g, (_, key) => {
    return variables[key.trim()] ?? "";
  });
}

function parseGoogleOAuthSecret(value: string): GoogleOAuthSecret | null {
  try {
    const parsed = JSON.parse(value) as GoogleOAuthSecret;

    if (
      parsed?.type === "google_oauth" &&
      typeof parsed?.refreshToken === "string" &&
      parsed.refreshToken.trim().length > 0
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildMimeMessage(params: {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): string {
  const toHeader = Array.isArray(params.to) ? params.to.join(", ") : params.to;
  const headers = [
    `From: ${params.from}`,
    `To: ${toHeader}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
  ];

  if (params.html && params.text) {
    const boundary = `mailzeno_${Date.now()}`;
    return [
      ...headers,
      `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      params.text,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "",
      params.html,
      "",
      `--${boundary}--`,
      "",
    ].join("\r\n");
  }

  if (params.html) {
    return [
      ...headers,
      'Content-Type: text/html; charset="UTF-8"',
      "",
      params.html,
      "",
    ].join("\r\n");
  }

  return [
    ...headers,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    params.text || "",
    "",
  ].join("\r\n");
}

async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_SMTP_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SMTP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google SMTP OAuth is not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh Google token: ${errorText}`);
  }

  const tokenData = (await response.json()) as { access_token?: string };

  if (!tokenData.access_token) {
    throw new Error("Google access token was not returned");
  }

  return tokenData.access_token;
}

async function sendViaGmailApi(params: {
  refreshToken: string;
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<{
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}> {
  const accessToken = await getGoogleAccessToken(params.refreshToken);
  const raw = encodeBase64Url(
    buildMimeMessage({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  );

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API send failed: ${errorText}`);
  }

  const data = (await response.json()) as { id?: string };
  const accepted = Array.isArray(params.to) ? params.to : [params.to];

  return {
    messageId: data.id || `gmail_${Date.now()}`,
    accepted,
    rejected: [],
    response: "Gmail API accepted",
  };
}

// Main service function

export async function sendEmailService(input: SendEmailInput) {
  const supabase = supabaseAdmin;

  try {
    // Get SMTP config and validate ownership
    let smtp: any = null;

    if (input.smtpId) {
      // Specific SMTP requested
      const { data } = await supabase
        .from("smtp_accounts")
        .select("*")
        .eq("id", input.smtpId)
        .eq("user_id", input.userId)
        .eq("is_active", true)
        .single();

      smtp = data;

      if (!smtp) {
        return { success: false, error: "SMTP account not found or inactive" };
      }
    } else {
      // Fallback to default SMTP
      const { data } = await supabase
        .from("smtp_accounts")
        .select("*")
        .eq("user_id", input.userId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      smtp = data;

      if (!smtp) {
        return {
          success: false,
          error: "No default SMTP configured. Please add one.",
        };
      }
    }

    validateRecipients(input.to);

    // Template processing

    let finalSubject = input.subject;
    let finalHtml = input.html;

    let template: { subject: string; body: string } | null = null;

    if (input.templateKey) {
      const { data } = await supabase
        .from("templates")
        .select("subject, body")
        .eq("slug", input.templateKey)
        .eq("user_id", input.userId)
        .single();

      if (!data) {
        return { success: false, error: "Template not found" };
      }

      template = data;
    } else if (input.templateId) {
      const { data } = await supabase
        .from("templates")
        .select("subject, body")
        .eq("id", input.templateId)
        .eq("user_id", input.userId)
        .single();

      if (!data) {
        return { success: false, error: "Template not found" };
      }

      template = data;
    }

    if (template) {
      finalSubject = renderTemplate(template.subject, input.variables);
      finalHtml = renderTemplate(template.body, input.variables);
    }

    if (!finalSubject || (!finalHtml && !input.text)) {
      return {
        success: false,
        error: "Provide template OR subject + html/text",
      };
    }

    // Atomic daily usage check + increment
    const plan = PLAN_CONFIG[input.plan];

    const { data: allowed, error: usageError } = await supabase.rpc(
      "increment_daily_usage_if_allowed",
      {
        p_user_id: input.userId,
        p_daily_limit: plan.dailyLimit,
      },
    );

    if (usageError) {
      console.error("[USAGE RPC ERROR]", usageError);
      return { success: false, error: "Usage check failed" };
    }

    if (!allowed) {
      return {
        success: false,
        error: "Daily email limit reached",
      };
    }

    // Decrypt SMTP password

    const encryptionService = createEncryptionService();
    const decryptedPassword = encryptionService.decrypt(
      smtp.password_encrypted,
    );

    const from = `${smtp.from_name || "MailZeno"} <${smtp.username}>`;
    const oauthSecret = parseGoogleOAuthSecret(decryptedPassword);

    let result:
      | {
          messageId: string;
          accepted: string[];
          rejected: string[];
          response: string;
        }
      | undefined;

    if (oauthSecret) {
      result = await sendViaGmailApi({
        refreshToken: oauthSecret.refreshToken,
        from,
        to: input.to,
        subject: finalSubject,
        html: finalHtml,
        text: input.text,
      });
    } else {
      const smtpConfig: SMTPConfig = {
        id: smtp.id,
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        user: smtp.username,
        pass: decryptedPassword,
      };

      result = await sendEmail(smtpConfig, {
        type: "raw",
        from,
        to: input.to,
        subject: finalSubject,
        html: finalHtml,
        text: input.text,
      });
    }

    // Log the email with retention policy
    const safeHtml =
      finalHtml && finalHtml.length > MAX_HTML_SIZE
        ? finalHtml.slice(0, MAX_HTML_SIZE)
        : finalHtml;

    const now = new Date();

    const retentionDays = plan.retentionDays;

    const retentionExpiresAt = new Date(
      now.getTime() + retentionDays * 24 * 60 * 60 * 1000,
    );

    await supabase.from("emails_log").insert({
      user_id: input.userId,
      smtp_id: smtp.id,
      to_email: Array.isArray(input.to) ? input.to.join(",") : input.to,
      subject: finalSubject,
      html: safeHtml ?? null,
      html_size: finalHtml ? finalHtml.length : 0,
      status: "sent",
      error: null,
      message_id: result.messageId,
      retention_expires_at: retentionExpiresAt.toISOString(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error("[EMAIL SEND ERROR]", err);

    return {
      success: false,
      error: "Email sending failed",
    };
  }
}
