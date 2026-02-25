import crypto from "crypto"

export function generateApiKey() {
  const random = crypto.randomBytes(24).toString("hex")
  return `mz_api_${random}`
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex")
}
