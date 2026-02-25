import { createClient } from "@/lib/supabase/server";

export async function getLogs(userId: string, page = 1, status?: string) {
  const supabase = await createClient();

  const PAGE_SIZE = 20;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("emails_log")
    .select("id, to_email, subject, html, error, status, created_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count } = await query;

  return {
    logs: data ?? [],
    total: count ?? 0,
    pageSize: PAGE_SIZE,
  };
}
