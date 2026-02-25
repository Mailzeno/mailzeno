export type User = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export type SMTPConfig = {
  id: string
  user_id: string
  name: string
  host: string
  port: number
  username: string
  password: string // encrypted
  from_email: string
  from_name: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type SMTPServiceConfig = {
  host: string
  port: number
  username: string
  password: string
  from_email: string
}


export type EmailTemplate = {
  id: string
  user_id: string
  name: string
  subject: string
  html_content: string
  created_at: string
  updated_at: string
}

export type EmailLog = {
  id: string
  user_id: string
  smtp_config_id: string
  template_id: string | null
  recipient: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  error_message: string | null
  created_at: string
  sent_at: string | null
}

export type BillingPlan = 'free' | 'pro' | 'enterprise'

export type Subscription = {
  id: string
  user_id: string
  plan: BillingPlan
  status: 'active' | 'canceled' | 'past_due'
  current_period_start: string
  current_period_end: string
  created_at: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}
