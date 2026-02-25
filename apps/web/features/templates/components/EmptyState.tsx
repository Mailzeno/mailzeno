import Link from "next/link";
import { Plus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="border rounded-xl p-10 sm:p-12 text-center bg-card">
      <h3 className="text-lg font-semibold">
        No templates yet
      </h3>

      <p className="text-sm text-muted-foreground mt-2">
        Create your first reusable email template.
      </p>

      <Link
        href="/dashboard/templates/new"
        className="inline-flex items-center justify-center gap-2 mt-6 bg-primary text-secondry-foreground border border-btn-border px-4 py-2 rounded-md hover:bg-primary/90 transition w-full sm:w-auto"
      >
        <Plus size={16} />
        Create Template
      </Link>
    </div>
  );
}
