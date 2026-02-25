export type Integration = {
  id: string
  label: string
  type: "sdk" | "serverless"
  install?: string
  code: {
    default?: string
    environments?: {
      id: string
      label: string
      snippet: string
    }[]
  }
}

export const integrations: Integration[] = [
  {
    id: "node",
    label: "Node.js",
    type: "sdk",
    install: "npm install @mailzeno/client",
    code: {
      default: `import MailZeno from "@mailzeno/client";

const mz = new MailZeno("mz_api_xxxxxxxx");

await mz.emails.send({
  from: "hello@yourapp.com",
  to: "user@example.com",
  subject: "Welcome 👋",
  html: "<strong>Hello world</strong>"
});`,
    },
  },

  {
    id: "python",
    label: "Python",
    type: "sdk",
    code: {
      default: `import requests

response = requests.post(
  "https://api.mailzeno.dev/v1/emails",
  headers={
    "Authorization": "Bearer mz_api_xxxxxxxx",
    "Content-Type": "application/json"
  },
  json={
    "from": "hello@yourapp.com",
    "to": "user@example.com",
    "subject": "Welcome 👋",
    "html": "<strong>Hello world</strong>"
  }
)

print(response.json())`,
    },
  },

  {
    id: "go",
    label: "Go",
    type: "sdk",
    code: {
      default: `package main

import (
  "bytes"
  "net/http"
)

func main() {
  payload := []byte(\`{
    "from": "hello@yourapp.com",
    "to": "user@example.com",
    "subject": "Welcome 👋",
    "html": "<strong>Hello world</strong>"
  }\`)

  req, _ := http.NewRequest(
    "POST",
    "https://api.mailzeno.dev/v1/emails",
    bytes.NewBuffer(payload),
  )

  req.Header.Set("Authorization", "Bearer mz_api_xxxxxxxx")
  req.Header.Set("Content-Type", "application/json")

  http.DefaultClient.Do(req)
}`,
    },
  },

  {
    id: "serverless",
    label: "Serverless",
    type: "serverless",
    code: {
      environments: [
        {
          id: "vercel",
          label: "Vercel",
          snippet: `// app/api/send/route.ts
import MailZeno from "@mailzeno/client";

export async function POST() {
  const mz = new MailZeno(process.env.MZ_API_KEY!);

  await mz.emails.send({
    from: "hello@yourapp.com",
    to: "user@example.com",
    subject: "Vercel Email",
    html: "<strong>Works on Vercel</strong>"
  });

  return Response.json({ success: true });
}`,
        },
        {
          id: "aws",
          label: "AWS Lambda",
          snippet: `import MailZeno from "@mailzeno/client";

export const handler = async () => {
  const mz = new MailZeno(process.env.MZ_API_KEY);

  await mz.emails.send({
    from: "hello@yourapp.com",
    to: "user@example.com",
    subject: "Lambda Email",
    html: "<strong>Works on Lambda</strong>"
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};`,
        },
        {
          id: "cloudflare",
          label: "Cloudflare Workers",
          snippet: `export default {
  async fetch(request, env) {
    await fetch("https://api.mailzeno.dev/v1/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.MZ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "hello@yourapp.com",
        to: "user@example.com",
        subject: "Cloudflare Email",
        html: "<strong>Edge delivery</strong>"
      })
    });

    return new Response("Email sent!");
  }
};`,
        },
      ],
    },
  },
]