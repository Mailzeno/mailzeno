import { sendEmail, SMTPConfig } from "@mailzeno/core";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createEncryptionService } from "@/lib/encryption";
import { PLAN_CONFIG } from "@/lib/plans";

interface SendEmailInput {
  userId: string;
  smtpId: string;
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

// Main service function

export async function sendEmailService(input: SendEmailInput) {
  const supabase = supabaseAdmin;

  try {
    // Get SMTP config and validate ownership
    const { data: smtp } = await supabase
      .from("smtp_accounts")
      .select("*")
      .eq("id", input.smtpId)
      .eq("user_id", input.userId)
      .single();

    if (!smtp) {
      return { success: false, error: "SMTP account not found" };
    }

    // For security, enforce that the "from" address matches the SMTP username
    if (input.from.toLowerCase() !== smtp.username.toLowerCase()) {
      return {
        success: false,
        error: "From address must match SMTP account",
      };
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
        .eq("template_key", input.templateKey)
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

    //-----------------------------------------------//

    // Pre check limits before sending

    // const plan = PLAN_CONFIG[input.plan];

    // const { data: usage, error: usageError } = await supabase.rpc(
    //   "get_daily_usage",
    //   { user_id_input: input.userId },
    // );

    // if (usageError) {
    //   console.error("[USAGE RPC ERROR]", usageError);
    //   return { success: false, error: "Usage check failed" };
    // }

    // const currentUsage = usage ?? 0;

    // if (currentUsage >= plan.dailyLimit) {
    //   return {
    //     success: false,
    //     error: "Daily email limit reached",
    //   };
    // }

    //------------------------------------------------------------//

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

    const smtpConfig: SMTPConfig = {
      id: smtp.id,
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      user: smtp.username,
      pass: decryptedPassword,
    };

    // Send the email
    const result = await sendEmail(smtpConfig, {
      type: "raw",
      from: input.from,
      to: input.to,
      subject: finalSubject,
      html: finalHtml,
      text: input.text,
    });

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
      smtp_id: input.smtpId,
      to_email: Array.isArray(input.to) ? input.to.join(",") : input.to,
      subject: finalSubject,
      html: safeHtml ?? null,
      html_size: finalHtml ? finalHtml.length : 0,
      status: "sent",
      error: null,
      message_id: result.messageId,
      retention_expires_at: retentionExpiresAt.toISOString(),
    });

    // Increment usage count
    // await supabase.rpc("increment_usage", {
    //   user_id_input: input.userId,
    // });

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
