export type MailZenoErrorCode =
  | "VALIDATION_ERROR"
  | "RENDER_ERROR"
  | "SMTP_CONNECTION_ERROR"
  | "SMTP_AUTH_ERROR"
  | "SMTP_RESPONSE_ERROR"
  | "SMTP_TIMEOUT_ERROR"
  | "UNKNOWN_ERROR"

export class MailZenoError extends Error {
  public readonly code: MailZenoErrorCode
  public readonly statusCode?: number
  public readonly cause?: unknown

  constructor(
    message: string,
    code: MailZenoErrorCode = "UNKNOWN_ERROR",
    options?: {
      statusCode?: number
      cause?: unknown
    }
  ) {
    super(message)

    this.name = this.constructor.name
    this.code = code
    this.statusCode = options?.statusCode
    this.cause = options?.cause

    Object.setPrototypeOf(this, new.target.prototype)

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}


 //  Specific Error Classes


export class ValidationError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "VALIDATION_ERROR", { statusCode: 400, cause })
  }
}

export class RenderError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "RENDER_ERROR", { cause })
  }
}

export class SMTPConnectionError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "SMTP_CONNECTION_ERROR", { cause })
  }
}

export class SMTPAuthError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "SMTP_AUTH_ERROR", { statusCode: 401, cause })
  }
}

export class SMTPResponseError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "SMTP_RESPONSE_ERROR", { cause })
  }
}

export class SMTPTimeoutError extends MailZenoError {
  constructor(message: string, cause?: unknown) {
    super(message, "SMTP_TIMEOUT_ERROR", { cause })
  }
}
