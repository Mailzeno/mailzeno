export const TEMPLATE_CATEGORIES = [
  "all",
  "onboarding",
  "security",
  "marketing",
  "business",
  "transactional",
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];
