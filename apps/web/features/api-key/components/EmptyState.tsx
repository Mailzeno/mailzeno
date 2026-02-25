"use client"

import { CreateKeyDialog } from "./CreateKeyDialog"

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="border rounded-2xl p-8 text-center">
      <h2 className="text-lg font-medium">No API Key Yet</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Generate an API key to start sending emails.
      </p>

      <div className="mt-6">
        <CreateKeyDialog onRefresh={onRefresh} />
      </div>
    </div>
  )
}
