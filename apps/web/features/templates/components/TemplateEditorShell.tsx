"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Save, Eye } from "lucide-react";
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
    `<h2>Hello {{name}},</h2><p>Start writing your email...</p>`,
  );

  /* ---------------- Fetch Template (Edit Mode) ---------------- */

  useEffect(() => {
    if (mode !== "edit" || !templateId) return;

    const fetchTemplate = async () => {
      try {
        setInitialLoading(true);

        const res = await fetch(`/api/templates/${templateId}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to load template");
        }

        const template = result.data ?? result;

        setName(template.name || "");
        setSubject(template.subject || "");
        setBody(template.body || "");
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load template.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchTemplate();
  }, [mode, templateId, toast]);

  /* ---------------- Starter Prefill ---------------- */

  useEffect(() => {
    if (mode !== "create") return;
    if (!starterId) return;

    const starter = starterTemplates.find((t) => t.id === starterId);

    if (!starter) return;

    setName(starter.name + " (Copy)");
    setSubject(starter.subject);
    setBody(starter.body);

    router.replace("/dashboard/templates/new", { scroll: false });
  }, [mode, starterId, router]);

  /* ---------------- Save Logic ---------------- */

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields before saving.",
        variant: "destructive",
      });
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
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save template");
      }

      toast({
        title: mode === "edit" ? "Template updated" : "Template saved",
        description:
          mode === "edit"
            ? "Your changes have been saved."
            : "Your template has been saved successfully.",
      });

      setTimeout(() => {
        router.push("/dashboard/templates");
      }, 600);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Variables ---------------- */

  const variables = [
    "{{name}}",
    "{{email}}",
    "{{company}}",
    "{{date}}",
    "{{custom}}",
  ];

  const insertVariable = (v: string) => {
    setBody((prev) => prev + " " + v);
  };

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
    <div className="space-y-6">
      {/* HEADER */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 pb-4 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className="flex items-center justify-between">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template Name"
          className="text-xl border rounded-md p-2 font-semibold bg-transparent focus:outline-none"
        />

        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2.5 text-xs rounded-md flex gap-1 border hover:bg-muted transition"
            type="button"
          >
            Preview <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant={"main"}
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-primary rounded-md flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save size={16} />
            {saving
              ? mode === "edit"
                ? "Updating..."
                : "Saving..."
              : mode === "edit"
                ? "Update"
                : "Save"}
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
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Variables:</span>
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

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl rounded-xl border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <h3 className="text-sm font-semibold tracking-tight">
                Email Preview
              </h3>

              <button
                onClick={() => setPreviewOpen(false)}
                className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition"
              >
                Close
              </button>
            </div>

            <PreviewTabs form={{ body }} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
