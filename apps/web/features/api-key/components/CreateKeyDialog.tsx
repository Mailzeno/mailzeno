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
import { Copy, Check } from "lucide-react"

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
      <Button type="button" variant={"main"} onClick={() => setOpen(true)}>
        Generate API Key
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {!newKey ? (
            <>
              <DialogHeader>
                <DialogTitle>Generate API Key?</DialogTitle>
                <DialogDescription>
                  This will create a new API key.
                </DialogDescription>
              </DialogHeader>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <DialogFooter>
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
                  This key will only be shown once.
                </DialogDescription>
              </DialogHeader>

              

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="secondary" onClick={handleCopy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" onClick={closeModal}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
