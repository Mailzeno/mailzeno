import Groq from "groq-sdk";
// @ts-ignore
import sanitizeHtml from "sanitize-html";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

type Mode = "text" | "html";
type Type = "generate" | "rewrite";

interface AIResponse {
  subject: string;
  content: string;
}

// Prompts

function buildSystemPrompt(mode: Mode, type: Type): string {
  const action =
    type === "rewrite"
      ? "You will be given an existing email. Rewrite and improve it while preserving meaning and intent."
      : "You will be given a description. Write a complete high-quality email based on it.";

  if (mode === "text") {
    return `
You are a professional email copywriter.

${action}

Write concise, structured, persuasive emails.

Return output strictly in this format:

Subject: <concise subject under 60 characters>

<plain text email body>

Rules:
- No markdown
- No explanations
- No emojis unless requested
- No extra commentary
`;
  }

  return `
You are a senior HTML email designer.

${action}

Create a premium modern HTML email.

Structure requirements:
- One wrapper table (width=100%)
- One centered container table (width=600px)
- Inline CSS only
- Professional CTA button
- Mobile-friendly
- No script, iframe, form, input
- No external CSS

Return output strictly in this format:

Subject: <subject under 60 characters>

<table>...</table>

Rules:
- No markdown
- No explanations
- Content MUST start with <table>
`;
}

// Sanitization and Validation

function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "table", "tbody", "thead", "tfoot", "tr", "td", "th",
      "div", "span",
      "h1", "h2", "h3", "h4",
      "p", "a", "br",
      "strong", "b", "em", "i", "u",
      "ul", "ol", "li",
      "img"
    ],
    allowedAttributes: {
      "*": ["style", "align", "width", "height", "bgcolor"],
      a: ["href", "style", "target", "rel"],
      img: ["src", "width", "height", "style", "alt"],
      td: ["colspan", "rowspan", "style", "align", "valign", "width", "height"],
      table: ["width", "style", "align", "cellpadding", "cellspacing", "border"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

function sanitizePlainText(text: string): string {
  const stripped = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return stripped
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, "")
    .replace(/system\s*prompt/gi, "")
    .trim();
}

 // Validation

function validateInput(type: Type, prompt?: string, content?: string): string {
  if (type === "generate") {
    if (!prompt?.trim()) throw new Error("Prompt required.");
    if (prompt.length > 2000) throw new Error("Prompt too long.");
    return prompt.trim();
  }

  if (!content?.trim()) throw new Error("Content required.");
  if (content.length > 2000) throw new Error("Content too long.");
  return content.trim();
}

// Main function

export async function generateEmailAI({
  mode,
  type,
  prompt,
  content,
}: {
  mode: Mode;
  type: Type;
  prompt?: string;
  content?: string;
}): Promise<AIResponse> {

  const systemPrompt = buildSystemPrompt(mode, type);
  const userInput = validateInput(type, prompt, content);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  let raw = response.choices[0]?.message?.content ?? "";

  if (!raw) {
    throw new Error("AI returned empty response.");
  }

  raw = raw.trim();

  // Extract subject and body

  const subjectMatch = raw.match(/Subject:\s*(.+)/i);

  let subject = subjectMatch ? subjectMatch[1].trim() : "Email";

  let body = raw.replace(/Subject:.*\n?/i, "").trim();

  // Mode 

  if (mode === "html") {
    const htmlStart = body.match(/<(table)/i);

    if (!htmlStart || htmlStart.index === undefined) {
      throw new Error("Invalid HTML returned by AI.");
    }

    body = body.slice(htmlStart.index);
    body = sanitizeEmailHtml(body);

    if (!body.includes("600")) {
      throw new Error("Email container missing 600px structure.");
    }
  } else {
    body = sanitizePlainText(body);
  }

  return {
    subject: subject.substring(0, 60),
    content: body,
  };
}
