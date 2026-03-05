"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CopyButton } from "./CopyButton"
import Link from "next/link"
import { ExternalLink, Code2, Terminal } from "lucide-react"
//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
//@ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

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

  const tabs = [
    { key: "curl" as const, label: "cURL", icon: Terminal },
    { key: "node" as const, label: "Node.js", icon: Code2 },
  ]

  return (
    <Card className="rounded-2xl border border-border/60 overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
              <Code2 className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold">Quick Start</h2>
              <p className="text-xs text-muted-foreground">
                Send your first email in seconds
              </p>
            </div>
          </div>

          <Link href="/docs">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 rounded-lg"
            >
              Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted/60 rounded-xl p-1 w-fit border border-border/40">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${tab === t.key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative group">
          <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton value={snippet} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/30">
            <SyntaxHighlighter
              language={tab === "curl" ? "bash" : "typescript"}
              style={oneDark}
              customStyle={{
                borderRadius: "12px",
                padding: "20px",
                paddingRight: "56px",
                fontSize: "12.5px",
                lineHeight: "1.7",
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
      </CardContent>
    </Card>
  )
}