import { z } from 'zod'

export const SendEmailSchema = z.object({
  smtp_config_id: z.string().uuid('Invalid SMTP config ID'),
  recipient: z.string().email('Invalid recipient email'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().min(1, 'Email content is required'),
  template_id: z.string().uuid().optional(),
})

export const SendEmailBatchSchema = z.object({
  smtp_config_id: z.string().uuid('Invalid SMTP config ID'),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().min(1, 'Email content is required'),
})

export type SendEmailInput = z.infer<typeof SendEmailSchema>
export type SendEmailBatchInput = z.infer<typeof SendEmailBatchSchema>
