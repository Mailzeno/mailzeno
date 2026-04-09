"use client";

import {
  CONDITION_OPERATORS,
  type FieldCondition,
  type FormField,
} from "@/components/forms/form-field-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type FieldConditionEditorProps = {
  enabled: boolean;
  condition?: FieldCondition;
  availableFields: FormField[];
  onToggle: (enabled: boolean) => void;
  onChange: (condition: Partial<FieldCondition>) => void;
};

export function FieldConditionEditor({
  enabled,
  condition,
  availableFields,
  onToggle,
  onChange,
}: FieldConditionEditorProps) {
  const noSourceFields = availableFields.length === 0;

  return (
    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Conditional Visibility</p>
          <p className="text-xs text-muted-foreground/80">
            Show this field only when a condition matches.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={noSourceFields}
        />
      </div>

      {noSourceFields ? (
        <p className="text-xs text-muted-foreground">
          Add at least one more field before using conditional visibility.
        </p>
      ) : null}

      {enabled && !noSourceFields ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <Select
            value={condition?.field ?? ""}
            onValueChange={(value) => onChange({ field: value })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.id} value={field.name}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition?.operator ?? "equals"}
            onValueChange={(value) =>
              onChange({ operator: value as FieldCondition["operator"] })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPERATORS.map((operator) => (
                <SelectItem key={operator.value} value={operator.value}>
                  {operator.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            value={condition?.value ?? ""}
            onChange={(event) => onChange({ value: event.target.value })}
            placeholder="Value"
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>
      ) : null}
    </div>
  );
}
