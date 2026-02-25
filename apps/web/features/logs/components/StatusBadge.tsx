export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "sent"
      ? "bg-primary/40"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : "bg-muted text-muted-foreground";

  return (
    <span
      className={`px-2 py-1 text-xs border border-btn-border rounded-full capitalize ${styles}`}
    >
      {status}
    </span>
  );
}
