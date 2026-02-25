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
import { RefreshCcw } from "lucide-react"

interface Props {
  onRefresh: () => void
}

export function RotateKeyDialog({ onRefresh }: Props) {
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const rotate = async () => {
    setLoading(true)
    const res = await fetch("/api/api-keys", { method: "POST" })
    const json = await res.json()

    if (res.ok) {
      setNewKey(json.apiKey)
    }

    setLoading(false)
  }

  const handleClose = () => {
    setOpen(false)
    setNewKey(null)
    onRefresh()
  }

  return (
    <>
      <Button variant="main" onClick={() => setOpen(true)}>
        Rotate Key <RefreshCcw/>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) handleClose()
          else setOpen(true)
        }}
      >
        <DialogContent>
          {!newKey ? (
            <>
              <DialogHeader>
                <DialogTitle>Rotate API Key?</DialogTitle>
                <DialogDescription>
                  This will deactivate the current key.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={rotate} disabled={loading}>
                  {loading ? "Rotating..." : "Confirm"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Your New API Key</DialogTitle>
                <DialogDescription>
                  Copy it now. It won’t be shown again.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                {newKey}
              </div>

              <DialogFooter>
                <Button onClick={handleClose}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
