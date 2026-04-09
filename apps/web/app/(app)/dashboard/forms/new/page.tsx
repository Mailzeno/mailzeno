"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Sparkles, BellRing, BellOff, Lightbulb } from "lucide-react";
import { FormFieldEditor } from "@/components/forms/form-field-editor";
import {
  FIELD_TYPES_WITH_OPTIONS,
  type FormField,
} from "@/components/forms/form-field-types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

const defaultFields: FormField[] = [
  { id: "name", name: "name", label: "Name", type: "text", required: true },
  { id: "email", name: "email", label: "Email", type: "email", required: true },
  {
    id: "message",
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
  },
];

export default function CreateFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [successMessage, setSuccessMessage] = useState(
    "Thanks! Your response has been submitted."
  );
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [schemaMode, setSchemaMode] = useState<"strict" | "flexible">("strict");
  const [loading, setLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const normalizedName = name.trim();
  const normalizedNotifyEmail = notifyEmail.trim();

  const hasInvalidFields = useMemo(
    () => {
      const availableNames = new Set(fields.map((field) => field.name.trim()));

      return fields.some((field) => {
        if (!field.name.trim() || !field.label.trim()) return true;

        if (FIELD_TYPES_WITH_OPTIONS.includes(field.type)) {
          const validOptions = (field.options ?? [])
            .map((option) => option.trim())
            .filter(Boolean);
          if (validOptions.length < 2) return true;
        }

        if (field.condition) {
          const sourceField = field.condition.field.trim();
          const conditionValue = field.condition.value.trim();

          if (!sourceField || !availableNames.has(sourceField)) return true;
          if (!conditionValue) return true;
        }

        return false;
      });
    },
    [fields]
  );

  const hasInvalidNotifyEmail = useMemo(() => {
    if (!emailEnabled || !normalizedNotifyEmail) return false;
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedNotifyEmail);
  }, [emailEnabled, normalizedNotifyEmail]);

  function addField() {
    const nextIndex = fields.length + 1;
    const id = `field-${Date.now()}-${nextIndex}`;
    setFields((prev) => [
      ...prev,
      {
        id,
        name: `field_${nextIndex}`,
        label: `Field ${nextIndex}`,
        type: "text",
        required: false,
      },
    ]);
  }

  function updateField(id: string, update: Partial<FormField>) {
    setFields((prev) => {
      const previousField = prev.find((field) => field.id === id);

      const updatedFields = prev.map((field) =>
        field.id === id ? { ...field, ...update } : field
      );

      if (
        previousField &&
        typeof update.name === "string" &&
        update.name.trim() &&
        previousField.name !== update.name
      ) {
        return updatedFields.map((field) => {
          if (field.condition?.field !== previousField.name) return field;
          return {
            ...field,
            condition: {
              ...field.condition,
              field: update.name!.trim(),
            },
          };
        });
      }

      return updatedFields;
    });
  }

  function removeField(id: string) {
    setFields((prev) => {
      const removed = prev.find((field) => field.id === id);
      if (!removed) return prev;

      return prev
        .filter((field) => field.id !== id)
        .map((field) => {
          if (field.condition?.field !== removed.name) return field;
          return { ...field, condition: undefined };
        });
    });
  }

  function reorderFields(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;

    setFields((prev) => {
      const sourceIndex = prev.findIndex((field) => field.id === sourceId);
      const targetIndex = prev.findIndex((field) => field.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);

      return updated;
    });
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(targetId: string) {
    if (!draggingId) return;
    reorderFields(draggingId, targetId);
    setDraggingId(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  async function handleCreate() {
    if (!normalizedName) {
      toast({
        title: "Form name required",
        description: "Please add a form name before creating.",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "No fields found",
        description: "Add at least one field to publish the form.",
        variant: "destructive",
      });
      return;
    }

    if (hasInvalidFields) {
      toast({
        title: "Fix field setup",
        description:
          "Every field needs name + label. Choice fields also need at least 2 options.",
        variant: "destructive",
      });
      return;
    }

    if (hasInvalidNotifyEmail) {
      toast({
        title: "Invalid notification email",
        description: "Please enter a valid email address for notifications.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          fields: fields.map(({ id, ...field }) => ({
            ...field,
            name: field.name.trim(),
            label: field.label.trim(),
            placeholder: field.placeholder?.trim() || undefined,
            options: FIELD_TYPES_WITH_OPTIONS.includes(field.type)
              ? (field.options ?? [])
                  .map((option) => option.trim())
                  .filter(Boolean)
              : undefined,
            condition: field.condition
              ? {
                  field: field.condition.field.trim(),
                  operator: field.condition.operator,
                  value: field.condition.value.trim(),
                }
              : undefined,
          })),
          settings: {
            success_message: successMessage,
            email_enabled: emailEnabled,
            notify_email: normalizedNotifyEmail || undefined,
            schema_mode: schemaMode,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create form");
      }

      if (!data?.form?.id) {
        throw new Error("Form created without an ID");
      }

      toast({
        title: "Form created",
        description: "Your form is live and ready to share.",
      });

      router.push(`/dashboard/forms/${data.form.id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to create form",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/forms"
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              Create Form
            </h1>
            <p className="text-sm text-muted-foreground">
              Build, automate, and publish a polished shareable form
            </p>
          </div>
        </div>

        <Button
          variant={"main"}
          onClick={handleCreate}
          disabled={
            loading ||
            hasInvalidFields ||
            fields.length === 0 ||
            hasInvalidNotifyEmail
          }
          className="hidden md:inline-flex bg-primary  px-5 py-2.5  font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Form"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Main */}
        <div className="md:col-span-3 space-y-6">
          <div className="border border-border/60 rounded-2xl p-6 bg-background space-y-6">
            <div>
              <label className="text-sm font-medium">Form Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lead Capture Form"
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Success Message</label>
              <input
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              Pro tip: use clear field labels and a short success message for better conversion.
            </div>
          </div>

          <div className="border border-border/60 rounded-2xl p-6 bg-background space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">Fields</h2>
                <p className="text-xs text-muted-foreground">
                  Add and customize the fields users will see.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <FormFieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  availableFields={fields}
                  onChange={updateField}
                  onRemove={removeField}
                  onDragStart={handleDragStart}
                  onDragOver={(id, event) => handleDragOver(event)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>

            <div className="sticky bottom-2 z-10 -mx-2 rounded-md border border-dashed border-border/70 bg-background/95 p-2 backdrop-blur">
              <Button
                type="button"
                onClick={addField}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                Add Field
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-border/60 rounded-2xl p-6 bg-background space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schema Mode</label>
              <select
                value={schemaMode}
                onChange={(event) =>
                  setSchemaMode(event.target.value === "flexible" ? "flexible" : "strict")
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="strict">Strict (recommended)</option>
                <option value="flexible">Flexible (allow extra custom fields)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Strict blocks unknown fields. Flexible accepts extras and stores them under _extra_fields.
              </p>
            </div>

            <div className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  Email Notifications
                  {emailEnabled ? (
                    <BellRing className="h-4 w-4 text-primary" />
                  ) : (
                    <BellOff className="h-4 w-4 text-primary" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Get notified on new submissions
                </p>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={(value) => setEmailEnabled(Boolean(value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notification Email</label>
              <input
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="ops@yourcompany.com"
                disabled={!emailEnabled}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-1  text-xs text-foreground/60">
                
                Leave blank to use your account email.
              </p>
              {hasInvalidNotifyEmail ? (
                <p className="mt-1 text-xs text-red-500">
                Please enter a valid email address.
                </p>
              ) : null}
            </div>

            <div className="text-xs text-muted-foreground bg-primary/10 p-1 rounded-md leading-5">
              <Lightbulb className="h-3 w-3 mb-1 text-primary inline-block mr-1" />
              Tip: Keep field names simple (e.g. name, email, message). They map
              to submission payload keys.
            </div>
          </div>

          <Button
            variant={"main"}
            onClick={handleCreate}
            disabled={
              loading ||
              hasInvalidFields ||
              fields.length === 0 ||
              hasInvalidNotifyEmail
            }
            className="py-2.5 font-medium text-sm hover:opacity-90 transition disabled:opacity-50 md:hidden"
          >
            {loading ? "Creating..." : "Create Form"}
          </Button>
        </div>
      </div>
    </div>
  );
}

