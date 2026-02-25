import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export interface DocMeta {
    slug: string;
    title: string;
    description: string;
    content: string;
}

/**
 * Metadata for each doc, keyed by slug.
 * Since @next/mdx doesn't support frontmatter natively,
 * we define metadata here as a central registry.
 */
const docMeta: Record<string, { title: string; description: string }> = {
    "getting-started": {
        title: "Getting Started",
        description:
            "Learn what Mailzeno is and how to start sending emails with the API-first SMTP platform.",
    },
    quickstart: {
        title: "Quickstart",
        description:
            "Send your first email with Mailzeno in under 2 minutes using the @mailzeno/client SDK.",
    },
    installation: {
        title: "Installation",
        description:
            "Install the @mailzeno/client SDK and configure your project for sending emails.",
    },
    "sending-emails": {
        title: "Sending Emails",
        description:
            "Learn how to send transactional emails with Mailzeno — raw HTML, templates, idempotency, and error handling.",
    },
    templates: {
        title: "Templates",
        description:
            "Send emails using stored templates with dynamic {{variable}} substitution.",
    },
    sdk: {
        title: "SDK Usage",
        description:
            "Advanced @mailzeno/client SDK guide — configuration, retry logic, content modes, and TypeScript types.",
    },
    "api-reference": {
        title: "API Reference",
        description:
            "REST API documentation for the Mailzeno email sending endpoint — POST /api/v1/emails.",
    },
    authentication: {
        title: "Authentication",
        description:
            "Learn how to authenticate with the Mailzeno API using API keys with SHA-256 hash-only storage.",
    },
    "rate-limits": {
        title: "Rate Limits",
        description:
            "Understand Mailzeno's dual-window rate limiting — per-minute and daily limits by plan.",
    },
    "error-codes": {
        title: "Error Codes",
        description:
            "Complete reference of Mailzeno API and core engine error codes, classes, and response format.",
    },
    webhooks: {
        title: "Webhooks",
        description:
            "Receive real-time notifications about email events via webhooks (coming soon).",
    },
    changelog: {
        title: "Changelog",
        description:
            "Track the latest updates, improvements, and new features in Mailzeno.",
    },
};

/**
 * Get all doc slugs for generateStaticParams.
 */
export function getAllSlugs(): string[] {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs
        .readdirSync(CONTENT_DIR)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get metadata for a single doc by slug.
 */
export function getDocBySlug(slug: string): DocMeta | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const rawContent = fs.readFileSync(filePath, "utf-8");

  const meta = docMeta[slug] ?? { title: slug, description: "" };

  return {
    slug,
    ...meta,
    content: rawContent,
  };
}

/**
 * Get all docs with metadata.
 */
export function getAllDocs(): DocMeta[] {
    return getAllSlugs()
        .map(getDocBySlug)
        .filter((doc): doc is DocMeta => doc !== null);
}


export function extractHeadings(content: string) {
  const regex = /^(##|###)\s+(.*)/gm;
  const headings = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[2];

    headings.push({
      text,
      level: match[1] === "##" ? 2 : 3,
      id: text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, ""),
    });
  }

  return headings;
}