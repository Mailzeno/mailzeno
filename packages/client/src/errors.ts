export class MailZenoError extends Error {
  status?: number
  code?: string
  requestId?: string

  constructor(
    message: string,
    options?: {
      status?: number
      code?: string
      requestId?: string
    }
  ) {
    super(message)
    this.name = "MailZenoError"
    this.status = options?.status
    this.code = options?.code
    this.requestId = options?.requestId
  }
}
