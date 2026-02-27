"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import RichEditor from "@/components/editor/RichEditor";
import { Button } from "@/components/ui/button";
import PreviewTabs from "@/components/dashboard/PreviewTabs";
import { useSearchParams } from "next/navigation";
import { starterTemplates } from "@/lib/templates/starter-templates";

interface TemplateEditorShellProps {
  mode: "create" | "edit";
  templateId?: string;
}

export default function TemplateEditorShell({
  mode,
  templateId,
}: TemplateEditorShellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const starterId = searchParams.get("starter");

  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    `<h2>Hello {{name}},</h2><p>Start writing your email...</p>`
  );

  /* ---------------- Fetch Template (Edit Mode) ---------------- */
  useEffect(() => {
    if (mode !== "edit" || !templateId) return;

    const fetchTemplate = async () => {
      try {
        setInitialLoading(true);
        const res = await fetch(`/api/templates/${templateId}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load template");
        const template = result.data ?? result;
        setName(template.name || "");
        setSubject(template.subject || "");
        setBody(template.body || "");
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to load template.", variant: "destructive" });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchTemplate();
  }, [mode, templateId, toast]);

  /* ---------------- Starter Prefill ---------------- */
  useEffect(() => {
    if (mode !== "create" || !starterId) return;
    const starter = starterTemplates.find((t) => t.id === starterId);
    if (!starter) return;
    setName(starter.name + " (Copy)");
    setSubject(starter.subject);
    setBody(starter.body);
    router.replace("/dashboard/templates/new", { scroll: false });
  }, [mode, starterId, router]);

  /* ---------------- Save ---------------- */
  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Please fill all fields before saving.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        mode === "edit" ? `/api/templates/${templateId}` : "/api/templates",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, subject, body }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save template");
      toast({
        title: mode === "edit" ? "Template updated" : "Template saved",
        description: mode === "edit" ? "Your changes have been saved." : "Your template has been saved successfully.",
      });
      setTimeout(() => router.push("/dashboard/templates"), 600);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Variables ---------------- */
  const variables = ["{{name}}", "{{email}}", "{{company}}", "{{date}}", "{{custom}}"];
  const insertVariable = (v: string) => setBody((prev) => prev + " " + v);

  /* ---------------- Skeleton ---------------- */
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-4 sm:space-y-6">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* HEADER — name input + action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template Name"
          className="text-lg sm:text-xl font-semibold bg-transparent border rounded-md px-3 py-2 focus:outline-none focus:border-primary transition w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs rounded-md border hover:bg-muted transition"
            type="button"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          <Button
            variant="main"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary rounded-md transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving
              ? mode === "edit" ? "Updating..." : "Saving..."
              : mode === "edit" ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* SUBJECT */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Email Subject"
        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary transition"
      />

      {/* VARIABLES */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Variables:</span>
        {variables.map((v) => (
          <button
            key={v}
            onClick={() => insertVariable(v)}
            className="px-3 py-1 text-xs border rounded-full hover:bg-muted transition"
          >
            {v}
          </button>
        ))}
      </div>

      {/* EDITOR */}
      <div className="border rounded-xl overflow-hidden focus-within:border-primary transition">
        <RichEditor
          value={body}
          onChange={setBody}
          minHeight={350}
          autoFocus={mode === "create"}
        />
      </div>

      {/* PREVIEW MODAL — full screen on mobile, centered modal on desktop */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full h-[92dvh] rounded-t-2xl
              sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:max-w-5xl
              border bg-card shadow-2xl overflow-hidden flex flex-col
            "
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/30 shrink-0">
              {/* Drag handle — visible only on mobile */}
              <div className="sm:hidden absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 rounded-full bg-muted-foreground/30" />
              <h3 className="text-sm font-semibold tracking-tight">Email Preview</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable preview content */}
            <div className="overflow-y-auto flex-1">
              <PreviewTabs form={{ body }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}