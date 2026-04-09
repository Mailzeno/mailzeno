export type FieldType =
  | "text"
  | "email"
  | "textarea"
  | "number"
  | "phone"
  | "select"
  | "date"
  | "time"
  | "radio"
  | "checkbox";

export type FieldConditionOperator =
  | "equals"
  | "not_equals"
  | "includes"
  | "not_includes";

export type FieldCondition = {
  field: string;
  operator: FieldConditionOperator;
  value: string;
};

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  condition?: FieldCondition;
};

export const FIELD_TYPE_OPTIONS: Array<{ value: FieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "phone", label: "Phone" },
  { value: "select", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "radio", label: "Multiple Choice (Single)" },
  { value: "checkbox", label: "Multiple Choice (Multiple)" },
];

export const FIELD_TYPES_WITH_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

export const CONDITION_OPERATORS: Array<{
  value: FieldConditionOperator;
  label: string;
}> = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Does not equal" },
  { value: "includes", label: "Includes" },
  { value: "not_includes", label: "Does not include" },
];
