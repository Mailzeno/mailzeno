type RawContent = {
  html: string
  text?: string
  templateId?: never
  templateKey?: never
  variables?: never
}

type TemplateContent =
  | {
      templateId: string
      variables?: Record<string, unknown>
      html?: never
      text?: never
      templateKey?: never
    }
  | {
      templateKey: string
      variables?: Record<string, unknown>
      html?: never
      text?: never
      templateId?: never
    }

export type SendEmailOptions = {
  smtpId: string
  from: string
  to: string | string[]
  subject: string
} & (RawContent | TemplateContent)


export interface SendEmailResponse {
  success: boolean
  messageId?: string
  accepted?: string[]
  rejected?: string[]
  response?: string
  error?: string
}
