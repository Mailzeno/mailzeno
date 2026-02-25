import { StatusBadge } from "./StatusBadge";

export function LogsTable({
  logs,
  onSelect,
}: {
  logs: any[];
  onSelect?: (log: any) => void;
}) {
  if (!logs || logs.length === 0) {
    return (
      <div className="rounded-2xl border shadow-sm p-10 text-center text-sm text-muted-foreground">
        No email logs yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left px-6 py-3 font-medium">
              Recipient
            </th>
            <th className="text-left px-6 py-3 font-medium">
              Subject
            </th>
            <th className="text-left px-6 py-3 font-medium">
              Status
            </th>
            <th className="text-right px-6 py-3 font-medium">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              onClick={() => onSelect?.(log)}
              className="border-b last:border-none hover:bg-muted/40 transition cursor-pointer"
            >
              <td className="px-6 py-4 max-w-[220px] truncate">
                {log.to_email}
              </td>

              <td className="px-6 py-4 max-w-[260px] truncate">
                {log.subject || "—"}
              </td>

              <td className="px-6 py-4">
                <StatusBadge status={log.status} />
              </td>

              <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
