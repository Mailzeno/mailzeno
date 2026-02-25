import { SMTPConfig, SendEmailOptions, SendEmailResponse } from "../types";

import { getTransporter } from "./transporter";
import { retry } from "../retry/retry-queue";
import { renderHtml } from "../render/render-html";
import { renderReact } from "../render/render-react";
import { interpolate } from "../render/interpolate";

import {
  ValidationError,
  RenderError,
  SMTPAuthError,
  SMTPConnectionError,
  SMTPResponseError,
  SMTPTimeoutError,
  MailZenoError,
} from "../errors";

/**
 * Core email sending engine
 * Throws errors on failure
 */
export async function sendEmail(
  smtp: SMTPConfig,
  options: SendEmailOptions,
): Promise<SendEmailResponse> {
  validateOptions(options);

  const { html, text } = await resolveContent(options);

  const subject = interpolate(options.subject, options.variables);
  const renderedHtml = interpolate(html, options.variables);
  const renderedText = interpolate(text, options.variables);

  const transporter = getTransporter(smtp);

  try {
    const info = await retry(() =>
      transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: subject,
        html: renderedHtml || undefined,
        text: renderedText || undefined,
      }),
    );

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } catch (err: any) {
    throw mapSMTPError(err);
  }
}

/* Validation */

function validateOptions(options: SendEmailOptions) {
  if (!options.from?.trim()) {
    throw new ValidationError("Invalid 'from' address");
  }

  if (!options.subject?.trim()) {
    throw new ValidationError("Subject is required");
  }

  if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
    throw new ValidationError("Invalid 'to' address");
  }
}

// Content Resolver

async function resolveContent(
  options: SendEmailOptions,
): Promise<{ html?: string; text?: string }> {
  switch (options.type) {
    case "react": {
      try {
        const rendered = await renderReact(options.react);
        return renderHtml(rendered.html);
      } catch (err) {
        throw new RenderError("React email rendering failed", err);
      }
    }

    case "raw": {
      return renderHtml(options.html, options.text);
    }
  }
}

//  SMTP error Mapping

function mapSMTPError(err: any): MailZenoError {
  if (err instanceof MailZenoError) {
    return err;
  }

  if (err?.code === "EAUTH") {
    return new SMTPAuthError("SMTP authentication failed", err);
  }

  if (err?.code === "ETIMEDOUT") {
    return new SMTPTimeoutError("SMTP connection timed out", err);
  }

  if (err?.code === "ECONNECTION") {
    return new SMTPConnectionError("SMTP connection failed", err);
  }

  if (err?.responseCode) {
    return new SMTPResponseError(`SMTP error ${err.responseCode}`, err);
  }

  return new SMTPResponseError(err?.message || "SMTP sending failed", err);
}
