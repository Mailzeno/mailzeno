"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, SquarePen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";

interface Props {
  template: Template;
  onDelete: (id: string) => void;
}

export function UserTemplateCard({ template, onDelete }: Props) {
  const router = useRouter();

  return (
    <div className="border rounded-xl p-4 sm:p-5 bg-card hover:shadow-md transition flex flex-col">

      {/* Top Section */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-md font-bold break-words line-clamp-2">
          {template.name}
        </h3>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/templates/${template.id}/edit`)
            }
            className="flex items-center gap-2 text-xs text-secondary-foreground rounded-md border px-2.5 py-1.5 hover:bg-muted transition-colors"
          >
            <SquarePen className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-secondry-foreground rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[95%] sm:max-w-sm p-0 overflow-hidden rounded-lg">
              <div className="px-5 py-4 border-b">
                <h2 className="text-base font-semibold">
                  Delete Template?
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Deleting this template will permanently remove all
                  associated data.
                </p>
              </div>

              <div className="flex border-t gap-3 px-6 py-5">
                <AlertDialogCancel className="flex-1">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDelete(template.id)}
                >
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-sm font-medium truncate">
          {template.subject}
        </p>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
          {template.body.replace(/<[^>]+>/g, "")}
        </p>

        <div className="mt-4 text-xs text-muted-foreground">
          {template.usage_count || 0} uses
        </div>
      </div>

      {/* Bottom Action */}
      <div className="mt-5">
        <Button
          type="button"
          onClick={() =>
            router.push(`/dashboard/send/${template.id}`)
          }
          className="w-full bg-primary text-secondary-foreground border border-btn-border text-sm py-2 rounded-md hover:bg-primary/90 transition"
        >
          Use Template
        </Button>
      </div>
    </div>
  );
}
