# MailZeno

![npm version](https://img.shields.io/npm/v/@mailzeno/client)
![npm downloads](https://img.shields.io/npm/dm/@mailzeno/client)
![license](https://img.shields.io/npm/l/@mailzeno/client)
![node](https://img.shields.io/node/v/@mailzeno/client)

Developer-first SMTP email infrastructure.

MailZeno is a modern transactional email system built for developers who want full SMTP control, strong security, and clean API ergonomics — without vendor lock-in.

Bring your own SMTP. Keep full control.


🌐 Website: https://mailzeno.dev  
📚 Documentation: https://docs.mailzeno.dev  
🐙 GitHub: https://github.com/mailzeno/mailzeno

---

## ✨ Core Features

- Bring Your Own SMTP (Gmail, Outlook, Zoho, SES, custom SMTP)
- API-first architecture
- AES-256-GCM encrypted SMTP credentials
- SMTP connection pooling
- Automatic retry for transient failures (SMTP 4xx + network errors)
- Exponential backoff with jitter
- Rate limit handling (429 + Retry-After support)
- Idempotency key support
- Structured error responses
- Request ID propagation
- React email rendering support
- Fully typed TypeScript SDK
- ESM + CommonJS support
- Node.js 18+ compatible

---

## 💡 Why MailZeno?

Most email APIs lock you into their infrastructure.

MailZeno is different:

- You use your own SMTP provider
- You control deliverability
- You control sender reputation
- You avoid vendor lock-in
- You keep portability

If you already have SMTP access (SES, Zoho, Gmail, Outlook, custom),
MailZeno gives you a modern API layer on top.

--- 

## 📦 Packages

| Package | Description |
|----------|-------------|
| [`@mailzeno/core`](./packages/core) | Low-level SMTP engine with pooling + retry |
| [`@mailzeno/client`](./packages/client) | Official JavaScript SDK for MailZeno API |

Install the SDK:

```bash
npm install @mailzeno/client
```

---

## ⚡ Quick Start

1. Create an account at https://mailzeno.dev
2. Add your SMTP credentials
3. Generate an API key
4. Install the SDK:

```bash
npm install @mailzeno/client
```

Then send your first email:

```ts
import { MailZeno } from "@mailzeno/client"

const mailzeno = new MailZeno("mz_api_your_api_key")

await mailzeno.emails.send({
  smtpId: "your_smtp_id",
  from: "you@example.com",
  to: "recipient@example.com",
  subject: "Hello from MailZeno",
  html: "<h1>Hello world</h1>"
})

```

---

## 🧩 Template Support

Send emails using stored templates with dynamic variables.

```ts
await mailzeno.emails.send({
  smtpId: "smtp_id",
  from: "you@example.com",
  to: "user@example.com",
  templateKey: "welcome_email",
  variables: {
    name: "Harsh",
    company: "MailZeno"
  }
})
```

Templates support `{{variable}}` placeholders.

Example template:

```html
<h1>Welcome {{name}}</h1>
<p>Thanks for joining {{company}}</p>
```

---

## 🔁 Idempotency

Prevent duplicate sends during retries or network failures:

```ts
await mailzeno.emails.send(
  {
    smtpId: "smtp_id",
    from: "you@example.com",
    to: "user@example.com",
    subject: "Payment receipt",
    html: "<h1>Thank you</h1>"
  },
  {
    idempotencyKey: "unique-request-id-123"
  }
)
```

---

## 🛠 Automatic Retry Behavior

The SDK automatically retries:

- HTTP 5xx responses
- 429 rate limit responses
- Network errors
- Timeouts

Retries use exponential backoff with jitter.

---

## ⚙️ Configuration

```ts
const mailzeno = new MailZeno("api_key", {
  baseUrl: "https://api.mailzeno.dev",
  retries: 2,
  retryDelay: 500,
  timeout: 10000
})
```

---

## ❌ Error Handling

```ts
try {
  await mailzeno.emails.send(payload)
} catch (error) {
  console.error(error)
}
```

Errors include:

- `status` (HTTP status)
- `code` (API error code)
- `requestId` (x-request-id for debugging)

---

## 🔐 Security Model

MailZeno is built with security-first principles:

- SMTP credentials encrypted using AES-256-GCM
- Strict TLS validation
- Per-user SMTP isolation
- API keys are stored as SHA-256 hashes
- Structured error handling
- Controlled retry strategy
- Rate limiting enforcement

---

## 🏗 Architecture Overview

MailZeno follows a layered design:

- `@mailzeno/core` → SMTP engine (pooling + retry)
- Service layer → Business logic
- API layer → Authentication + rate limiting
- `@mailzeno/client` → Developer SDK

This separation keeps the SMTP engine reusable while enforcing SaaS policies at the API layer.

---

## 🗂 Project Structure

```
mailzeno/
├─ packages/
│  ├─ core/
│  └─ client/
├─ apps/
│  └─ web/
```

---

## 🚀 Current Status

Version: 0.x (Public Beta)

MailZeno is under active development.  
Breaking changes may occur before v1 stable.

---

## 🤝 Contributing

Contributions and feedback are welcome.

Please open an issue before submitting major changes.

---

## 📄 License

The open-source packages under `/packages` are licensed under the MIT License.

The SaaS application code under `/apps/web` is part of the MailZeno hosted service and is not intended for commercial redistribution.