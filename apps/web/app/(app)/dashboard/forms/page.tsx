"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Copy, Trash2, Check, ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type Form = {
  id: string;
  name: string;
  created_at: string;
  submissions_count?: number;
  slug: string;
  is_active?: boolean;
  settings?: {
    notify_email?: string;
    email_enabled?: boolean;
  };
};

export default function FormsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  async function copyTextToClipboard(text: string): Promise<boolean> {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      typeof window !== "undefined" &&
      window.isSecureContext
    ) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // fall through to legacy fallback for Safari/iOS compatibility
      }
    }

    if (typeof document === "undefined") {
      return false;
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }

  async function fetchForms() {
    try {
      const res = await fetch("/api/v1/forms");
      if (!res.ok) {
        throw new Error("Failed to fetch forms");
      }
      const data = await res.json();
      const nextForms = data.forms || [];
      setForms(nextForms);
      setSelectedFormId((prev) => prev ?? nextForms[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not load forms",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(form: Form) {
    const publicUrl = `${window.location.origin}/f/${form.slug}`;

    try {
      const copied = await copyTextToClipboard(publicUrl);
      if (!copied) {
        throw new Error("clipboard_unavailable");
      }

      setCopyingId(form.id);
      toast({
        title: "Link copied",
        description: `${form.name} public link copied to clipboard.`,
      });

      window.setTimeout(() => {
        setCopyingId((prev) => (prev === form.id ? null : prev));
      }, 1300);
    } catch {
      toast({
        title: "Copy failed",
        description: "Copy blocked on this browser. Press and hold the link to copy manually.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(form: Form) {
    const confirmed = window.confirm(
      `Delete \"${form.name}\"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(form.id);
    try {
      const res = await fetch("/api/v1/forms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to delete form");
      }

      setForms((prev) => {
        const next = prev.filter((item) => item.id !== form.id);
        setSelectedFormId((current) => {
          if (current !== form.id) return current;
          return next[0]?.id ?? null;
        });
        return next;
      });

      toast({
        title: "Form deleted",
        description: `${form.name} has been removed.`,
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? null;

  return (
    <div className="md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your forms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/forms/submissions">
            <Button variant="outline" className="text-sm">
              Submissions
            </Button>
          </Link>

          <Link href="/dashboard/forms/new">
            <Button
              variant={"main"}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg border-btn-border border text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : forms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FormsTable
              forms={forms}
              selectedFormId={selectedFormId}
              copyingId={copyingId}
              deletingId={deletingId}
              onSelect={(form) => setSelectedFormId(form.id)}
              onOpen={(form) => router.push(`/dashboard/forms/${form.id}`)}
              onEdit={(form) => router.push(`/dashboard/forms/${form.id}/edit`)}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />
          </div>

          <div className="border border-border/60 rounded-xl p-5 bg-card h-fit">
            {selectedForm ? (
              <QuickDetails
                form={selectedForm}
                onOpen={() => router.push(`/dashboard/forms/${selectedForm.id}`)}
                onEdit={() => router.push(`/dashboard/forms/${selectedForm.id}/edit`)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a form to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormsTable({
  forms,
  selectedFormId,
  copyingId,
  deletingId,
  onSelect,
  onOpen,
  onEdit,
  onCopy,
  onDelete,
}: {
  forms: Form[];
  selectedFormId: string | null;
  copyingId: string | null;
  deletingId: string | null;
  onSelect: (form: Form) => void;
  onOpen: (form: Form) => void;
  onEdit: (form: Form) => void;
  onCopy: (form: Form) => Promise<void>;
  onDelete: (form: Form) => Promise<void>;
}) {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div className="hidden md:grid grid-cols-4 px-5 py-3 text-xs font-medium text-muted-foreground border-b">
        <span>Name</span>
        <span>Submissions</span>
        <span>Created</span>
        <span className="text-right">Actions</span>
      </div>

      {forms.map((form) => (
        <div
          key={form.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(form)}
          onDoubleClick={() => onOpen(form)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onOpen(form);
              return;
            }
            if (event.key === " ") {
              event.preventDefault();
              onSelect(form);
            }
          }}
          className={`grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 px-5 py-4 border-b last:border-none items-center cursor-pointer transition ${
            selectedFormId === form.id ? "bg-muted/50" : "hover:bg-muted/30"
          }`}
        >
          {/* Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="font-medium">{form.name}</p>
          </div>

          {/* Submissions */}
          <div className="text-sm text-muted-foreground">
            {form.submissions_count ?? 0}
          </div>

          {/* Date */}
          <div className="text-sm text-muted-foreground">
            {new Date(form.created_at).toLocaleDateString()}
          </div>

          {/* Actions */}
          <div className="flex md:justify-end gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onEdit(form);
              }}
              aria-label={`Edit ${form.name}`}
              className="p-2 rounded-lg hover:bg-muted transition"
            >
              <Pencil className="w-4 h-4" />
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                void onCopy(form);
              }}
              aria-label={`Copy ${form.name} link`}
              className="p-2 rounded-lg hover:bg-muted transition"
            >
              {copyingId === form.id ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(event) => {
                event.stopPropagation();
                void onDelete(form);
              }}
              disabled={deletingId === form.id}
              aria-label={`Delete ${form.name}`}
              className="p-2 rounded-lg hover:bg-muted transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickDetails({
  form,
  onOpen,
  onEdit,
}: {
  form: Form;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const notifyEmail =
    form.settings?.email_enabled === false
      ? "Notifications are disabled"
      : form.settings?.notify_email || "Uses account email";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Quick details</p>
        <h2 className="text-lg font-semibold mt-1">{form.name}</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Submissions</span>
          <span className="font-medium">{form.submissions_count ?? 0}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{form.is_active === false ? "Inactive" : "Active"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Created</span>
          <span className="font-medium">
            {new Date(form.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground break-all">
        Notification: {notifyEmail}
      </div>

      <Button onClick={onOpen} variant="main" className="w-full">
        Open Full Details
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Button onClick={onEdit} variant="outline" className="w-full">
        Edit Form
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <FileText className="w-5 h-5 text-muted-foreground" />
      </div>

      <h3 className="font-semibold">No forms yet</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Create your first form to start collecting submissions
      </p>

      <Link href="/dashboard/forms/new">
        <Button
          variant={"main"}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Create Form
        </Button>
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
