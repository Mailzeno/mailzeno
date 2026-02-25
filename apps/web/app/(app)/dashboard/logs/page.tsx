import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLogs } from "@/features/logs/lib/get-logs";
import { LogsHeader } from "@/features/logs/components/LogsHeader";
import { LogsView } from "@/features/logs/components/LogsView";
import { Pagination } from "@/features/logs/components/Pagination";

export default async function LogsPage({
  searchParams,
}: {
  searchParams?: { page?: string; status?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const page = Number(searchParams?.page ?? 1);
  const status = searchParams?.status ?? "all";

  const { logs, total, pageSize } = await getLogs(
    user.id,
    page,
    status
  );

  return (
    <div className="px-4 md:px-0 space-y-8">
      <LogsHeader currentStatus={status} />

      {/* Client wrapper handles drawer + responsiveness */}
      <LogsView logs={logs} />

      {total > pageSize && (
        <Pagination
          total={total}
          pageSize={pageSize}
          currentPage={page}
        />
      )}
    </div>
  );
}
