"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ModeWarningModal({
  open,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[92%] sm:max-w-sm p-0 overflow-hidden rounded-lg bg-card border shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b">
          <h2 className="text-base font-semibold">
             Switch Editor Mode?
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Some advanced HTML formatting may be lost.
          </p>
        </div>

        {/* Body */}
        <div className="flex gap-3 px-5 py-3 bg-red-500/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500/30">
            <AlertTriangle className="h-5 w-5 text-secondry-foreground" />
          </div>

          <p className="text-sm text-secondry-foreground leading-relaxed">
            Editor mode does not fully support inline styles, tables or
            custom classes. Switching may simplify your HTML structure.
          </p>
        </div>

        {/* Footer */}
        <div className="flex border-t gap-3 px-6 py-5">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-md transition"
          >
            Stay in HTML
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-md transition"
          >
            Switch Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}





