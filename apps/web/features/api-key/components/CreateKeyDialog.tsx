"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, KeyRound, AlertCircle } from "lucide-react"

interface CreateKeyDialogProps {
  onRefresh: () => void
}

export function CreateKeyDialog({ onRefresh }: CreateKeyDialogProps) {
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/api-keys", { method: "POST" })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || "Failed")

      setNewKey(json.apiKey)
      if (typeof window !== "undefined" && json.apiKey) {
        window.localStorage.setItem("mailzeno_active_api_key", json.apiKey)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeModal = () => {
    setOpen(false)
    setNewKey(null)
    setCopied(false)
    setError(null)
    onRefresh()
  }

  return (
    <>
      <Button type="button" variant={"main"} onClick={() => setOpen(true)} className="gap-2">
        <KeyRound className="w-4 h-4" />
        Generate API Key
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {!newKey ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Generate API Key?
                </DialogTitle>
                <DialogDescription>
                  This will create a new API key for your account. You can use it
                  to authenticate API requests and send emails.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="button" onClick={generate} disabled={loading}>
                  {loading ? "Generating..." : "Confirm"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Your API Key</DialogTitle>
                <DialogDescription>
                  This key will only be shown once. Copy and store it securely.
                </DialogDescription>
              </DialogHeader>

              <div className="relative group">
                <div className="bg-muted/60 border border-border/50 px-4 py-3 rounded-xl font-mono text-sm break-all select-all tracking-wider">
                  {newKey}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="secondary" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Key"}
                </Button>
                <Button type="button" onClick={closeModal}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
