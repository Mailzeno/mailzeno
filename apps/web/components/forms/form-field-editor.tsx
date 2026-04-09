"use client";

import { type DragEvent } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FIELD_TYPE_OPTIONS,
  FIELD_TYPES_WITH_OPTIONS,
  type FieldType,
  type FormField,
} from "@/components/forms/form-field-types";
import { FieldOptionsEditor } from "@/components/forms/field-options-editor";
import { FieldConditionEditor } from "@/components/forms/field-condition-editor";

type FormFieldEditorProps = {
  field: FormField;
  index: number;
  availableFields: FormField[];
  onChange: (id: string, update: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, event: DragEvent<HTMLDivElement>) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
};

export function FormFieldEditor({
  field,
  index,
  availableFields,
  onChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: FormFieldEditorProps) {
  const needsOptions = FIELD_TYPES_WITH_OPTIONS.includes(field.type);
  const supportsPlaceholder =
    !needsOptions && field.type !== "date" && field.type !== "time";
  const conditionEnabled = Boolean(field.condition);
  const conditionFieldChoices = availableFields.filter(
    (candidate) => candidate.id !== field.id
  );

  return (
    <div
      className="border border-border rounded-xl p-4 space-y-3"
      onDragOver={(event) => onDragOver(field.id, event)}
      onDrop={() => onDrop(field.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-md hover:bg-muted transition cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={() => onDragStart(field.id)}
            onDragEnd={onDragEnd}
            aria-label="Reorder field"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-medium">Field {index + 1}</p>
        </div>
        <button
          onClick={() => onRemove(field.id)}
          className="p-2 rounded-md hover:bg-muted transition"
          aria-label="Remove field"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Label
          </label>
          <input
            value={field.label}
            onChange={(e) => onChange(field.id, { label: e.target.value })}
            placeholder="Full Name"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Field Name
          </label>
          <input
            value={field.name}
            onChange={(e) => onChange(field.id, { name: e.target.value })}
            placeholder="full_name"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select
            value={field.type}
            onValueChange={(value) => {
              const nextType = value as FieldType;
              onChange(field.id, {
                type: nextType,
                ...(FIELD_TYPES_WITH_OPTIONS.includes(nextType)
                  ? {
                      options:
                        field.options && field.options.length >= 2
                          ? field.options
                          : ["Option 1", "Option 2"],
                    }
                  : { options: undefined }),
              });
            }}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder
          </label>
          <input
            value={field.placeholder || ""}
            onChange={(e) =>
              onChange(field.id, { placeholder: e.target.value })
            }
            placeholder={supportsPlaceholder ? "e.g. John Doe" : "Not used for this field type"}
            disabled={!supportsPlaceholder}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm disabled:opacity-60"
          />
        </div>
      </div>

      {needsOptions ? (
        <FieldOptionsEditor
          options={field.options ?? []}
          onChange={(options) => onChange(field.id, { options })}
        />
      ) : null}

      <FieldConditionEditor
        enabled={conditionEnabled}
        condition={field.condition}
        availableFields={conditionFieldChoices}
        onToggle={(enabled) => {
          if (!enabled) {
            onChange(field.id, { condition: undefined });
            return;
          }

          const firstField = conditionFieldChoices[0];
          if (!firstField) return;

          onChange(field.id, {
            condition: {
              field: firstField.name,
              operator: "equals",
              value: "",
            },
          });
        }}
        onChange={(conditionUpdate) => {
          onChange(field.id, {
            condition: {
              field: field.condition?.field ?? conditionFieldChoices[0]?.name ?? "",
              operator: field.condition?.operator ?? "equals",
              value: field.condition?.value ?? "",
              ...conditionUpdate,
            },
          });
        }}
      />

      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox
          checked={field.required}
          onCheckedChange={(value) =>
            onChange(field.id, { required: Boolean(value) })
          }
        />
        Required
      </label>
    </div>
  );
}
