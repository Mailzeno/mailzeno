"use client";

import { useEffect, useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, BellRing, BellOff, Lightbulb } from "lucide-react";
import { FormFieldEditor } from "@/components/forms/form-field-editor";
import {
  FIELD_TYPES_WITH_OPTIONS,
  type FormField,
} from "@/components/forms/form-field-types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

type ApiFormField = {
  name?: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  condition?: {
    field: string;
    operator: "equals" | "not_equals" | "includes" | "not_includes";
    value: string;
  };
};

function fieldTypeOrDefault(type: string | undefined): FormField["type"] {
  if (
    type === "text" ||
    type === "email" ||
    type === "textarea" ||
    type === "number" ||
    type === "phone" ||
    type === "select" ||
    type === "date" ||
    type === "time" ||
    type === "radio" ||
    type === "checkbox"
  ) {
    return type;
  }

  return "text";
}

function toEditableField(field: ApiFormField, index: number): FormField {
  const name = typeof field.name === "string" && field.name.trim()
    ? field.name.trim()
    : `field_${index + 1}`;

  return {
    id: `${name}-${index}-${Date.now()}`,
    name,
    label:
      typeof field.label === "string" && field.label.trim()
        ? field.label.trim()
        : name,
    type: fieldTypeOrDefault(field.type),
    required: Boolean(field.required),
    placeholder:
      typeof field.placeholder === "string" && field.placeholder.trim()
        ? field.placeholder.trim()
        : undefined,
    options: Array.isArray(field.options)
      ? field.options.map((option) => String(option).trim()).filter(Boolean)
      : undefined,
    condition:
      field.condition && typeof field.condition === "object"
        ? {
            field: String(field.condition.field || "").trim(),
            operator:
              field.condition.operator === "not_equals" ||
              field.condition.operator === "includes" ||
              field.condition.operator === "not_includes"
                ? field.condition.operator
                : "equals",
            value: String(field.condition.value || "").trim(),
          }
        : undefined,
  };
}

export default function EditFormPage() {
  const params = useParams<{ id: string }>();
  const formId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [successMessage, setSuccessMessage] = useState(
    "Thanks! Your response has been submitted."
  );
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [schemaMode, setSchemaMode] = useState<"strict" | "flexible">("strict");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const normalizedName = name.trim();
  const normalizedNotifyEmail = notifyEmail.trim();

  useEffect(() => {
    let cancelled = false;

    async function fetchForm() {
      if (!formId) {
        setInitialLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/v1/forms/manage/${formId}`, {
          method: "GET",
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.form) {
          throw new Error(data?.error || "Failed to load form");
        }

        if (cancelled) return;

        const form = data.form;
        const parsedSettings =
          form?.settings && typeof form.settings === "object"
            ? form.settings
            : {};

        const parsedSchema =
          form?.schema && typeof form.schema === "object" && Array.isArray(form.schema.fields)
            ? form.schema.fields
            : [];

        const editableFields = parsedSchema.map((field: ApiFormField, index: number) =>
          toEditableField(field, index)
        );

        setName(typeof form.name === "string" ? form.name : "");
        setFields(editableFields);
        setSuccessMessage(
          typeof parsedSettings.success_message === "string" && parsedSettings.success_message
            ? parsedSettings.success_message
            : "Thanks! Your response has been submitted."
        );
        setEmailEnabled(parsedSettings.email_enabled !== false);
        setNotifyEmail(
          typeof parsedSettings.notify_email === "string" ? parsedSettings.notify_email : ""
        );
        setSchemaMode(parsedSettings.schema_mode === "flexible" ? "flexible" : "strict");
      } catch (error) {
        toast({
          title: "Failed to load form",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    }

    fetchForm();

    return () => {
      cancelled = true;
    };
  }, [formId, toast]);

  const hasInvalidFields = useMemo(() => {
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
  }, [fields]);

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

  async function handleSave() {
    if (!formId) return;

    if (!normalizedName) {
      toast({
        title: "Form name required",
        description: "Please add a form name before saving.",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "No fields found",
        description: "Add at least one field before saving.",
        variant: "destructive",
      });
      return;
    }

    if (hasInvalidFields) {
      toast({
        title: "Fix field setup",
        description:
          "Every field needs name + label. Choice fields need at least 2 options.",
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
      const res = await fetch(`/api/v1/forms/manage/${formId}`, {
        method: "PATCH",
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

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to update form");
      }

      toast({
        title: "Form updated",
        description: "Changes saved successfully.",
      });

      router.push(`/dashboard/forms/${formId}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to update form",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="md:p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-10 w-56 rounded-md bg-muted animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={"/dashboard/forms"}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Edit Form</h1>
            <p className="text-sm text-muted-foreground">
              Update fields, settings, and schema mode.
            </p>
          </div>
        </div>

        <Button
          variant="main"
          onClick={handleSave}
          disabled={loading || hasInvalidFields || fields.length === 0 || hasInvalidNotifyEmail}
          className="hidden md:inline-flex px-5 py-2.5 font-medium text-sm"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
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
              <Lightbulb className="h-3 w-3 mb-1 text-primary inline-block mr-1" />
              Keep names stable to avoid breaking existing integrations.
            </div>
          </div>

          <div className="border border-border/60 rounded-2xl p-6 bg-background space-y-4">
            <div>
              <h2 className="text-sm font-medium">Fields</h2>
              <p className="text-xs text-muted-foreground">
                Reorder, edit, or add fields.
              </p>
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
              {hasInvalidNotifyEmail ? (
                <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
              ) : null}
            </div>
          </div>

          <Button
            variant="main"
            onClick={handleSave}
            disabled={loading || hasInvalidFields || fields.length === 0 || hasInvalidNotifyEmail}
            className="py-2.5 font-medium text-sm md:hidden"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
