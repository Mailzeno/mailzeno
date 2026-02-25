export async function getSMTPAccounts() {
  const res = await fetch("/api/smtp");

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch SMTP accounts");
  }

  return data.data || [];
}

export async function updateSMTP(id: string, payload: any) {
  const res = await fetch(`/api/smtp/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update SMTP");
  }

  return data;
}

export async function deleteSMTP(id: string) {
  const res = await fetch(`/api/smtp/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete SMTP");
  }
}
