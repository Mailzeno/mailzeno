"use client"

import { formatDistanceToNow } from "date-fns"
import { RotateKeyDialog } from "./RotateKeyDialog"

interface Props {
  data: any
  onRefresh: () => void
}

export function ApiKeyCard({ data, onRefresh }: Props) {
  const maskedKey = `${data.prefix}****************`

  return (
    <div className="border rounded-2xl p-6 bg-card space-y-6">
      <div className="flex justify-between items-start gap-6">
        <div className="space-y-3">
          <h2 className="font-semibold">Active API Key</h2>

          <div className="bg-muted border p-2 rounded-lg font-mono text-sm">
            {maskedKey}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Created {formatDistanceToNow(new Date(data.created_at))} ago
            </p>

            {data.last_used_at && (
              <p>
                Last used{" "}
                {formatDistanceToNow(new Date(data.last_used_at))} ago
              </p>
            )}
          </div>
        </div>

        <RotateKeyDialog onRefresh={onRefresh} />
      </div>
    </div>
  )
}
