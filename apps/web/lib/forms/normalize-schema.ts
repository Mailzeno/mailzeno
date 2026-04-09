export type FormField = {
  name: string;
  label: string;
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

type FormSchema = {
  fields: FormField[];
};

function toLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeField(input: any): FormField | null {
  if (typeof input === "string") {
    const name = input.trim();
    if (!name) return null;
    return {
      name,
      label: toLabel(name),
      type: "text",
      required: true,
    };
  }

  if (input && typeof input === "object") {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (!name) return null;

    const label =
      typeof input.label === "string" && input.label.trim()
        ? input.label.trim()
        : toLabel(name);

    const type =
      typeof input.type === "string" && input.type.trim()
        ? input.type.trim()
        : "text";

    const placeholder =
      typeof input.placeholder === "string" && input.placeholder.trim()
        ? input.placeholder.trim()
        : undefined;

    const options = Array.isArray(input.options)
      ? input.options
          .map((option: unknown) =>
            typeof option === "string" ? option.trim() : ""
          )
          .filter(Boolean)
      : undefined;

    const rawCondition = input.condition;
    const condition =
      rawCondition && typeof rawCondition === "object"
        ? {
            field:
              typeof rawCondition.field === "string"
                ? rawCondition.field.trim()
                : "",
            operator:
              rawCondition.operator === "equals" ||
              rawCondition.operator === "not_equals" ||
              rawCondition.operator === "includes" ||
              rawCondition.operator === "not_includes"
                ? rawCondition.operator
                : "equals",
            value:
              typeof rawCondition.value === "string"
                ? rawCondition.value.trim()
                : "",
          }
        : undefined;

    return {
      name,
      label,
      type,
      required: Boolean(input.required),
      ...(placeholder ? { placeholder } : {}),
      ...(options && options.length > 0 ? { options } : {}),
      ...(condition && condition.field ? { condition } : {}),
    };
  }

  return null;
}

function normalizeFields(fields: any[]) {
  return fields
    .map((field) => normalizeField(field))
    .filter(Boolean) as FormField[];
}

export function normalizeFormSchema(schema: unknown): FormSchema {
  let parsed: any = schema;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  if (Array.isArray(parsed)) {
    return { fields: normalizeFields(parsed) };
  }

  if (parsed && typeof parsed === "object" && Array.isArray(parsed.fields)) {
    return { fields: normalizeFields(parsed.fields) };
  }

  return { fields: [] };
}
