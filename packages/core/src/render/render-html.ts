export function renderHtml(
  html?: string,
  text?: string
): { html?: string; text?: string } {

  const cleanHtml = html?.trim()
  const cleanText = text?.trim()

  if (!cleanHtml && !cleanText) {
    throw new Error("Email must contain html or text")
  }

  return {
    html: cleanHtml || undefined,
    text: cleanText || undefined
  }
}