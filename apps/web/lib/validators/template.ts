import { z } from 'zod'

export const EmailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().min(1, 'HTML content is required'),
})

export const UpdateEmailTemplateSchema = EmailTemplateSchema.partial().extend({
  id: z.string().uuid(),
})

export type EmailTemplateInput = z.infer<typeof EmailTemplateSchema>
export type UpdateEmailTemplateInput = z.infer<typeof UpdateEmailTemplateSchema>
