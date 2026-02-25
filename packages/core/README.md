# @mailzeno/core

SMTP engine powering MailZeno.

Low-level email sending library with:

- SMTP pooling
- Retry logic
- Exponential backoff
- Transient error detection
- React email rendering
- Timeout handling

---

## Installation

```bash
npm install @mailzeno/core
```

---

## Usage

```ts
import { sendEmail } from "@mailzeno/core"

await sendEmail(
  {
    id: "smtp_id",
    host: "smtp.example.com",
    port: 587,
    secure: false,
    user: "username",
    pass: "password"
  },
  {
    from: "you@example.com",
    to: "recipient@example.com",
    subject: "Hello",
    html: "<h1>Hello world</h1>"
  }
)
```

---

## Features

- SMTP connection pooling
- AES-safe config handling (handled by parent app)
- Automatic retries for transient failures
- React email rendering support
- Structured error mapping
- ESM + CommonJS support

---

## Requirements

- Node.js >= 18

---

## License

MIT © MailZeno
