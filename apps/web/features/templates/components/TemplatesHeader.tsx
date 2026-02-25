import Link from "next/link";
import { Plus } from "lucide-react";

export function TemplatesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Build and manage reusable email content
        </p>
      </div>

      <Link
        href="/dashboard/templates/new"
        className="inline-flex items-center justify-center gap-2 border border-btn-border bg-primary text-secondry-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition w-full sm:w-auto"
      >
        <Plus size={16} />
        New Template
      </Link>
    </div>
  );
}
