import nodemailer from 'nodemailer'
import type { SMTPConfig } from '@/types'
import type { SMTPServiceConfig } from "@/types"
import { SMTPConnectionError, SMTPConfigError } from './errors'

export class SMTPService {
  private transporter: nodemailer.Transporter | null = null
  private config: SMTPServiceConfig

  constructor(config: SMTPServiceConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.transporter) {
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        auth: {
          user: this.config.username,
          pass: this.config.password,
        },
      })

      // Verify connection
      await this.transporter.verify()
    } catch (error) {
      throw new SMTPConnectionError(
        error instanceof Error ? error.message : 'Failed to connect to SMTP server'
      )
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<string> {
    if (!this.transporter) {
      await this.connect()
    }

    if (!this.transporter) {
      throw new SMTPConfigError('Transporter not initialized')
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config.from_email,
        to,
        subject,
        html,
      })

      return info.messageId
    } catch (error) {
      throw new SMTPConnectionError(
        error instanceof Error ? error.message : 'Failed to send email'
      )
    }
  }

  async disconnect(): Promise<void> {
    if (this.transporter) {
      await this.transporter.close()
      this.transporter = null
    }
  }
}

