"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, KeyRound, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type FormIntegrationActionsProps = {
  formId: string;
  publicApiKey: string;
  snippets: {
    embed: string;
    autoSubmit: string;
  };
};

export function FormIntegrationActions({
  formId,
  publicApiKey,
  snippets,
}: FormIntegrationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [regenerating, setRegenerating] = useState(false);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${label} copied to clipboard.`,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard access is blocked in this browser.",
        variant: "destructive",
      });
    }
  }

  async function regeneratePublicKey() {
    const confirmed = window.confirm(
      "Regenerate public API key? Existing website integrations will stop working until updated."
    );
    if (!confirmed) return;

    setRegenerating(true);

    try {
      const res = await fetch("/api/v1/forms", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formId,
          action: "regenerate_public_api_key",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to regenerate public API key");
      }

      toast({
        title: "Public API key regenerated",
        description: "New key generated. Copy and update your integration now.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Regeneration failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not regenerate public API key.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copyText(publicApiKey, "Public API key")}
          disabled={!publicApiKey || publicApiKey === "Not generated"}
        >
          <KeyRound className="h-4 w-4" />
          Copy Public API Key
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={regeneratePublicKey}
          disabled={regenerating}
        >
          <RefreshCcw className="h-4 w-4" />
          {regenerating ? "Regenerating..." : "Regenerate Public API Key"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copyText(snippets.embed, "Hosted embed snippet")}
        >
          <Copy className="h-4 w-4" />
          Copy Embed Snippet
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => copyText(snippets.autoSubmit, "Auto-submit snippet")}
        >
          <Copy className="h-4 w-4" />
          Copy Script + Form Snippet
        </Button>
      </div>
    </div>
  );
}
