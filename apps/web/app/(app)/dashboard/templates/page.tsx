"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Template } from "@/types/template";
import {
  fetchTemplates,
  deleteTemplate,
  duplicateTemplate,
} from "@/lib/templates/templates";

import { TemplatesPageSkeleton } from "@/features/templates/TemplatesPageSkeleton";
import { StarterSection } from "@/features/templates/components/StarterSection";
import { UserSection } from "@/features/templates/components/UserSection";
import { TemplatesHeader } from "@/features/templates/components/TemplatesHeader";
import { TemplatesSearch } from "@/features/templates/components/TemplatesSearch";
import PreviewModal from "@/features/send-email/components/PreviewModal";

export default function TemplatesPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [search, setSearch] = useState("");
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTemplates();
        setUserTemplates(data.data || []);
      } catch (error) {
        toast({
          title: "Failed to load templates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredUser = useMemo(() => {
    return userTemplates.filter((t) =>
      `${t.name} ${t.subject}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, userTemplates]);

  async function handleDelete(id: string) {
    try {
      await deleteTemplate(id);
      setUserTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Template deleted",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  }

  async function handleDuplicate(id: string) {
    const data = await duplicateTemplate(id);
    router.push(`/templates/${data.id}/edit`);
  }

  if (loading) {
    return <TemplatesPageSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <button
        onClick={() => router.back()}
        className="flex items-center pt-0 gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <TemplatesHeader />
      <TemplatesSearch value={search} onChange={setSearch} />
      <StarterSection
        search={search}
        onDuplicate={handleDuplicate}
        onPreview={(template) => setPreviewTemplate(template)}
      />
      <UserSection
        templates={filteredUser}
        loading={false}
        onDelete={handleDelete}
      />
      <PreviewModal
        open={!!previewTemplate}
        form={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
}
