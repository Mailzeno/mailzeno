import nodemailer, { Transporter } from "nodemailer"
import { SMTPConfig } from "../types"

const transporterCache = new Map<string, Transporter>()

function getCacheKey(smtp: SMTPConfig): string {
  return `${smtp.id}:${smtp.host}:${smtp.port}:${smtp.user}`
}

export function getTransporter(smtp: SMTPConfig): Transporter {
  const key = getCacheKey(smtp)

  if (transporterCache.has(key)) {
    return transporterCache.get(key)!
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    pool: true,
    maxConnections: smtp.maxConnections ?? 5,
    maxMessages: smtp.maxMessages ?? 1000,
    connectionTimeout: smtp.connectionTimeout ?? 10_000,
    greetingTimeout: smtp.greetingTimeout ?? 10_000,
    socketTimeout: smtp.socketTimeout ?? 15_000,
    auth: {
      user: smtp.user,
      pass: smtp.pass
    },
    tls: {
      rejectUnauthorized: true
    }
  })

  // Self-healing: remove broken transporter from cache
  transporter.on("error", () => {
    transporterCache.delete(key)
  })

  transporterCache.set(key, transporter)

  return transporter
}
