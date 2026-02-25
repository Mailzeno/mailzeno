"use client";

import { useParams } from "next/navigation";
import TemplateEditorShell from "@/features/templates/components/TemplateEditorShell";


export default function EditTemplatePage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  if (!id) {
    return (
      <div className="p-8">
        <p className="text-sm text-destructive">
          Invalid template ID.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <TemplateEditorShell mode="edit" templateId={id} />
    </div>
  );
}
