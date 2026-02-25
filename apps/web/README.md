# MailZeno Web Application

This directory contains the official MailZeno SaaS dashboard application.

MailZeno follows an open-core model:
The core SMTP engine and SDK are open-source,
while this web application powers the official hosted service.

The web app powers the hosted MailZeno service available at:
https://mailzeno.dev

---

## Purpose

The web application provides:

- User authentication (Supabase)
- API key management
- SMTP configuration management
- Email sending dashboard
- Usage tracking & rate limits
- Email logs and analytics
- AI-assisted email composition

This app integrates with the MailZeno Core engine (`@mailzeno/core`) and the public SDK (`@mailzeno/client`).

---

## Architecture Overview

- Framework: Next.js (App Router)
- Runtime: Node.js >= 18
- Database: Supabase (Postgres + Auth)
- API-first design (versioned `/api/v1`)
- Redis-based rate limiting
- Encrypted SMTP credential storage (AES-256-GCM)

The core email engine lives inside `/packages/core`.

The public JavaScript SDK lives inside `/packages/client`.

---

## License & Usage

This directory contains the official MailZeno hosted SaaS implementation.

MailZeno follows an open-core model:
the core SMTP engine and SDK under `/packages` are licensed under the MIT License,
while this web application powers the official hosted service.

The SaaS layer is provided for transparency and educational purposes.

Commercial redistribution, resale, or operating a competing hosted service
based on this implementation is not permitted without explicit written permission
from the MailZeno team.

---

## Contribution Policy

Community contributions are welcome for:

- UI improvements
- Bug fixes
- Performance optimizations
- Developer experience improvements

However:

- SaaS-layer decisions
- Abuse-prevention systems
- Billing logic
- Infrastructure policies

are maintained at the core team's discretion.

Submitting a pull request does not guarantee acceptance.

---

## Development

To run locally:

1. Install dependencies
2. Configure environment variables
3. Run development server

```bash
npm install
npm run dev
```

---

## Environment Variables

The following environment variables are required:

```

SUPABASE_URL:Your Supabase URL
SUPABASE_ANON_KEY: Your Supabase Anon Key
SUPABASE_SERVICE_ROLE_KEY: Service Role
ENCRYPTION_KEY:           //(32-byte hex)
UPSTASH_REDIS_REST_URL: Your Upstash Url
UPSTASH_REDIS_REST_TOKEN: Redis Token
GROQ_API_KEY: Groq Api

```

Ensure all secrets are properly configured before running locally.

---

## Security Notice

This repository includes infrastructure-level logic for authentication,
rate limiting, and SMTP encryption.

Do not deploy this application without properly securing:
- Environment variables
- API keys
- Redis configuration
- Supabase RLS policies