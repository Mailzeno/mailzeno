// /lib/validators/forms.validator.ts

function toValueArray(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((value) => String(value));
  }

  if (input === undefined || input === null) {
    return [];
  }

  return [String(input)];
}

function isFieldVisible(field: any, body: Record<string, unknown>) {
  const condition = field?.condition;
  if (!condition || typeof condition !== "object") return true;

  const sourceField =
    typeof condition.field === "string" ? condition.field.trim() : "";
  const expectedValue =
    typeof condition.value === "string" ? condition.value.trim() : "";
  const operator =
    typeof condition.operator === "string" ? condition.operator : "equals";

  if (!sourceField) return true;

  const sourceValues = toValueArray(body[sourceField]).map((value) => value.trim());

  switch (operator) {
    case "not_equals":
      return sourceValues.every((value) => value !== expectedValue);
    case "includes":
      return sourceValues.some((value) => value === expectedValue);
    case "not_includes":
      return sourceValues.every((value) => value !== expectedValue);
    case "equals":
    default:
      return sourceValues[0] === expectedValue;
  }
}

export function validateForm(fields: any[], body: any) {
  if (!Array.isArray(fields) || !body || typeof body !== "object") {
    return "Invalid submission";
  }

  const payload = body as Record<string, unknown>;

  for (const field of fields) {
    if (!field || typeof field.name !== "string") {
      continue;
    }

    if (!isFieldVisible(field, payload)) {
      continue;
    }

    const label =
      typeof field.label === "string" && field.label.trim()
        ? field.label
        : field.name;
    const value = payload[field.name];
    const type = typeof field.type === "string" ? field.type : "text";
    const hasValue = Array.isArray(value)
      ? value.some((item) => String(item).trim() !== "")
      : value !== undefined && value !== null && String(value).trim() !== "";

    if (field.required && !hasValue) {
      return `${label} is required`;
    }

    if (type === "email" && hasValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return `Invalid email for ${label}`;
      }
    }

    if (
      (type === "select" || type === "radio" || type === "checkbox") &&
      hasValue
    ) {
      const allowedOptions = Array.isArray(field.options)
        ? field.options.map((option: unknown) => String(option))
        : [];

      if (allowedOptions.length > 0) {
        const values = Array.isArray(value) ? value : [value];
        for (const selected of values) {
          if (!allowedOptions.includes(String(selected))) {
            return `Invalid option for ${label}`;
          }
        }
      }
    }
  }

  return null;
}
