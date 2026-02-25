# @mailzeno/client

![npm version](https://img.shields.io/npm/v/@mailzeno/client)
![npm downloads](https://img.shields.io/npm/dm/@mailzeno/client)
![license](https://img.shields.io/npm/l/@mailzeno/client)
![node](https://img.shields.io/node/v/@mailzeno/client)

Official JavaScript SDK for MailZeno — developer-first transactional email infrastructure.

Send emails through your own SMTP via MailZeno’s secure API with built-in retries, idempotency support, structured errors, and full TypeScript support.

---

## Installation

```bash
npm install @mailzeno/client
```

---

## Quick Start

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

## Template Support

Send using a stored template:

```ts
await mailzeno.emails.send({
  smtpId: "your_smtp_id",
  from: "you@example.com",
  to: "recipient@example.com",
  templateKey: "welcome_email",
  variables: {
    name: "Harsh",
    company: "MailZeno"
  }
})
```

Templates support dynamic variables using `{{variable}}` placeholders.

---

## Idempotency

Prevent duplicate sends during retries:

```ts
await mailzeno.emails.send(
  {
    smtpId: "smtp_id",
    from: "you@example.com",
    to: "recipient@example.com",
    subject: "Payment receipt",
    html: "<h1>Thank you</h1>"
  },
  {
    idempotencyKey: "unique-request-id-123"
  }
)
```

---

## Automatic Retry Behavior

The SDK automatically retries:

- HTTP 5xx errors
- 429 rate limit responses (respects `Retry-After` header)
- Network failures
- Timeouts

Retries use exponential backoff with jitter.

---

## Configuration

```ts
const mailzeno = new MailZeno("api_key", {
  baseUrl: "https://api.mailzeno.dev", // optional
  retries: 2,                      // default: 2
  retryDelay: 500,                 // default: 500ms
  timeout: 10000                   // default: 10s
})
```

---

## Error Handling

```ts
try {
  await mailzeno.emails.send(payload)
} catch (err) {
  console.error(err)
}
```

Errors include:

- `status` (HTTP status)
- `code` (API error code)
- `requestId` (x-request-id for debugging)

---

## Requirements

- Node.js >= 18

---

## License

MIT © MailZeno
