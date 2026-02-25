export function getHeadings(source: string) {
  const regex = /^(##|###)\s+(.*)/gm;
  const headings = [];
  let match;

  while ((match = regex.exec(source)) !== null) {
    headings.push({
      text: match[2],
      level: match[1] === "##" ? 2 : 3,
      id: match[2]
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, ""),
    });
  }

  return headings;
}