"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "./CopyButton"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
//@ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { lightFormat } from "date-fns"

export function IntegrationSection() {
  const [tab, setTab] = useState<"curl" | "node">("curl")

  const curlSnippet = `curl -X POST https://api.mailzeno.dev/v1/emails \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "smtpId": "your_smtp_id", // optional if you have a default SMTP set up
    "from": "you@domain.com",
    "to": "user@example.com",
    "subject": "Hello",
    "html": "<h1>Hello World</h1>"
  }'`

  const nodeSnippet = `import { MailZeno } from "@mailzeno/client"

const mailZeno = new MailZeno("YOUR_API_KEY")

await mailZeno.emails.send({
  smtpId: "your_smtp_id",
  from: "you@domain.com",
  to: "user@example.com",
  subject: "Hello",
  html: "<h1>Hello World</h1>"
})`

  const snippet = tab === "curl" ? curlSnippet : nodeSnippet

  return (
    <div className="border rounded-2xl p-4 sm:p-6 bg-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold">Quick Start</h2>

        <Link href="/docs">
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            Docs
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "curl" ? "main" : "outline"}
          size="sm"
          onClick={() => setTab("curl")}
        >
          cURL
        </Button>

        <Button
          variant={tab === "node" ? "main" : "outline"}
          size="sm"
          onClick={() => setTab("node")}
        >
          Node.js
        </Button>
      </div>

      {/* Code block — horizontally scrollable on mobile, no page scroll lock */}
      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <CopyButton value={snippet} />
        </div>

        <div className="overflow-x-auto rounded-xl">
          <SyntaxHighlighter
            language={tab === "curl" ? "bash" : "typescript"}
            style={oneDark}
            customStyle={{
              borderRadius: "12px",
              padding: "16px",
              paddingRight: "48px", // space for copy button
              fontSize: "12px",
              marginTop: "0",
              marginBottom: "0",
              minWidth: "100%",
              whiteSpace: "pre",
            }}
            wrapLines={false}
            wrapLongLines={false}
          >
            {snippet}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}