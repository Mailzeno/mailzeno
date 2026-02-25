import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

function stripFrontmatter(content: string) {
  return content.replace(/^---[\s\S]*?---/, "").trim();
}

function stripCodeBlocks(content: string) {
  return content.replace(/```[\s\S]*?```/g, "");
}

function stripMarkdown(content: string) {
  return content
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/[*_~`]/g, "") // formatting chars
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/>\s?/g, "") // blockquotes
    .replace(/\n+/g, " ") // new lines
    .replace(/\s+/g, " ") // extra spaces
    .trim();
}

function extractTitle(content: string, fallback: string) {
  const match = content.match(/^#\s+(.*)/m);
  if (match) return match[1].trim();
  return fallback.replace(/-/g, " ");
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.error("❌ CONTENT DIR NOT FOUND");
  process.exit(1);
}

const files = fs.readdirSync(CONTENT_DIR);

const data = files
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => {
    const slug = file.replace(".mdx", "");
    const raw = fs.readFileSync(
      path.join(CONTENT_DIR, file),
      "utf-8"
    );

    const noFrontmatter = stripFrontmatter(raw);
    const title = extractTitle(noFrontmatter, slug);

    const cleanContent = stripMarkdown(
      stripCodeBlocks(noFrontmatter)
    );

    return {
      slug,
      title,
      content: cleanContent,
    };
  });

if (!fs.existsSync(path.join(process.cwd(), "public"))) {
  fs.mkdirSync(path.join(process.cwd(), "public"));
}

fs.writeFileSync(
  OUTPUT_PATH,
  JSON.stringify(data, null, 2)
);

console.log("✅ Search index generated:", data.length, "documents");