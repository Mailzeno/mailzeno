"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { RotateKeyDialog } from "./RotateKeyDialog"
import { Shield, Clock, Activity, Eye, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  data: any
  onRefresh: () => void
}

export function ApiKeyCard({ data, onRefresh }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cachedKey, setCachedKey] = useState<string | null>(null)

  const maskedKey = `${data.prefix}${"*".repeat(9)}`
  const keyMatchesPrefix = useMemo(() => {
    if (!cachedKey) return false
    return cachedKey.startsWith(data.prefix)
  }, [cachedKey, data.prefix])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("mailzeno_active_api_key")
    setCachedKey(stored)
  }, [data.prefix])

  const handleCopy = async () => {
    if (!cachedKey || !keyMatchesPrefix) return
    await navigator.clipboard.writeText(cachedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="rounded-2xl border border-border/60 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
          <div className="space-y-4 min-w-0 flex-1">
            {/* Title Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10">
                <Shield className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Active API Key</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Masked Key */}
            <div className="bg-muted/60 border border-border/50 px-4 py-3 rounded-xl font-mono text-xs sm:text-sm break-all select-all tracking-wider text-muted-foreground">
              {maskedKey}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Created{" "}
                  {formatDistanceToNow(new Date(data.created_at))} ago
                </span>
              </div>

              {data.last_used_at && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>
                    Last used{" "}
                    {formatDistanceToNow(new Date(data.last_used_at))} ago
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setOpen(true)}
              >
                <Eye className="w-4 h-4" />
                View Key
              </Button>
              <RotateKeyDialog onRefresh={onRefresh} />
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Current API Key</DialogTitle>
            <DialogDescription>
              View and copy your active API key on this device.
            </DialogDescription>
          </DialogHeader>

          {cachedKey && keyMatchesPrefix ? (
            <>
              <div className="relative group">
                <div className="bg-muted/60 border border-border/50 px-4 py-3 rounded-xl font-mono text-sm break-all select-all tracking-wider">
                  {cachedKey}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition"
                  aria-label="Copy API key"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Key"}
                </Button>
                <Button type="button" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Key preview is unavailable on this device for the current active
                key. Rotate once to generate and cache a new key here.
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}