export async function fetchTemplates() {
  const res = await fetch("/api/templates");

  if (!res.ok) {
    throw new Error("Failed to fetch templates");
  }

  return res.json();
}

export async function deleteTemplate(id: string) {
  const res = await fetch(`/api/templates/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete template");
  }

  return true;
}

export async function duplicateTemplate(id: string) {
  const res = await fetch("/api/templates/duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to duplicate template");
  }

  return res.json();
}
