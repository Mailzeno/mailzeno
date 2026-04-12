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
import { RefreshCcw, AlertTriangle, Copy, Check } from "lucide-react"

interface Props {
  onRefresh: () => void
}

export function RotateKeyDialog({ onRefresh }: Props) {
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const rotate = async () => {
    setLoading(true)
    const res = await fetch("/api/api-keys", { method: "POST" })
    const json = await res.json()

    if (res.ok) {
      setNewKey(json.apiKey)
      if (typeof window !== "undefined" && json.apiKey) {
        window.localStorage.setItem("mailzeno_active_api_key", json.apiKey)
      }
    }

    setLoading(false)
  }

  const handleCopy = async () => {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setOpen(false)
    setNewKey(null)
    setCopied(false)
    onRefresh()
  }

  return (
    <>
      <Button
        variant="main"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <RefreshCcw className="w-4 h-4" />
        Rotate Key
      </Button>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) handleClose()
          else setOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {!newKey ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Rotate API Key?
                </DialogTitle>
                <DialogDescription>
                  This will immediately deactivate your current key and generate
                  a new one. Any integrations using the old key will stop
                  working.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={rotate} disabled={loading}>
                  {loading ? "Rotating..." : "Confirm Rotation"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Your New API Key</DialogTitle>
                <DialogDescription>
                  Copy it now — it won't be shown again.
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

              <DialogFooter>
                <Button onClick={handleClose}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
