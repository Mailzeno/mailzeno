import type React from "react"

/**
 * SMTP configuration (engine-level only)
 */
export interface SMTPConfig {
  id: string

  host: string
  port: number
  secure: boolean

  user: string
  pass: string

  connectionTimeout?: number
  greetingTimeout?: number
  socketTimeout?: number

  maxConnections?: number
  maxMessages?: number
}

/**
 * Raw HTML email content
 */
type RawContent = {
  type: "raw"
  html?: string
  text?: string
}

/**
 * React email content
 */
type ReactContent = {
  type: "react"
  react: React.ReactElement
}

/**
 * Strict email options
 */
export type SendEmailOptions = {
  from: string
  to: string | string[]
  subject: string
  variables?: Record<string, string | number | boolean>
} & (RawContent | ReactContent)

/**
 * Engine success response
 * Throws on failure
 */
export interface SendEmailResponse {
  messageId: string
  accepted: string[]
  rejected: string[]
  response: string
}