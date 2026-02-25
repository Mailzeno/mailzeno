export function interpolate(
  content?: string,
  variables?: Record<string, string | number | boolean>,
): string | undefined {
  if (!content || !variables) return content;

  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : "";
  });
}