import TemplateEditorShell from "@/features/templates/components/TemplateEditorShell";

export const metadata = {
  title: "New Template - mailzeno",
  description: "Create a new email template",
};

export default function NewTemplatePage() {
  return (
    <div className="md:p-8 max-w-7xl mx-auto">
      <TemplateEditorShell mode="create" />
    </div>
  );
}
