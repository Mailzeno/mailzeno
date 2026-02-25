import { z } from 'zod'

export const SMTPConfigSchema = z.object({
  name: z.string().min(1, 'SMTP name is required'),
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  from_email: z.string().email('Invalid from email'),
  from_name: z.string().optional(),
  is_default: z.boolean().default(false),
})

export const UpdateSMTPConfigSchema = SMTPConfigSchema.partial().extend({
  id: z.string().uuid(),
})

export type SMTPConfigInput = z.infer<typeof SMTPConfigSchema>
export type UpdateSMTPConfigInput = z.infer<typeof UpdateSMTPConfigSchema>
