"use client";

import { Plus, ArrowLeft } from "lucide-react";
import SMTPCard from "@/features/smtp/components/SMTPCard";
import SMTPSkeleton from "@/features/smtp/components/SMTPSkeleton";
import { useSMTP } from "@/features/smtp/hooks/useSMTP";
import { useRouter } from "next/navigation";

export default function SMTPPage() {
  const router = useRouter();
  const { accounts, loading, processingId, toggleDefault, remove } = useSMTP();

  return (
    <div className="md:p-6 space-y-8">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SMTP Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage and control your email infrastructure
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/smtp/new")}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-secondary-foreground border border-btn-border hover:opacity-90 transition w-full sm:w-auto"
        >
          <Plus size={16} />
          Add SMTP
        </button>
      </div>

      {loading ? (
        <SMTPSkeleton />
      ) : accounts.length === 0 ? (
        <div className="border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No SMTP accounts connected yet.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/smtp/new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-primary/80 border border-btn-border bg-primary text-secondary-foreground"
          >
            <Plus size={16} />
            Add First SMTP
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((smtp) => (
            <SMTPCard
              key={smtp.id}
              smtp={smtp}
              processingId={processingId}
              onToggle={toggleDefault}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}