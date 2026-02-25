"use client";

import { useState } from "react";
import { Loader2, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { starterTemplates } from "@/lib/templates/starter-templates";
import { useSendEmail } from "@/features/send-email/hooks/useSendEmail";
import EmailFormSection from "@/features/send-email/components/EmailFormSection";
import MessageEditor from "@/features/send-email/components/MessageEditor";
import PreviewModal from "@/features/send-email/components/PreviewModal";
import ModeWarningModal from "@/features/send-email/components/ModeWarningModal";
import SendEmailPageSkeleton from "@/features/send-email/components/SendEmailPageSkeleton";
import { TemplateModal } from "@/components/TemplateModal";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function SendEmailPage() {
  const params = useParams();
  const templateId = params?.templateId as string;

  const {
    smtpList,
    templates,
    selectedSMTP,
    setSelectedSMTP,
    form,
    setForm,
    errors,
    setErrors,
    apiError,
    pageLoading,
    sending,
    handleSend,
  } = useSendEmail();

  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
  if (!templateId) return;

  // Check in starterTemplates (local JSON)
  const starter = starterTemplates.find(
    (t) => t.id === templateId
  );

  if (starter) {
    setForm((prev) => ({
      ...prev,
      subject: starter.subject,
      body: starter.body,
    }));
    return; // stop here
  }

  // Otherwise fetch from API (user template)
  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${templateId}`);
      const result = await res.json();

      if (!res.ok) return;

      const template = result.data ?? result;

      setForm((prev) => ({
        ...prev,
        subject: template.subject || "",
        body: template.body || "",
      }));
    } catch (err) {
      console.error("Failed to load template", err);
    }
  };

  fetchTemplate();

}, [templateId, setForm]);

  if (pageLoading) {
    return <SendEmailPageSkeleton />;
  }

  const applyTemplate = (template: any) => {
    setForm((prev) => ({
      ...prev,
      subject: template.subject,
      body: template.body,
    }));
    toast({ title: "Template applied" });
    setTemplateOpen(false);
  };

  // for warning modal
  const hasRiskyStyles = (html: string) => {
    const riskyPatterns = [
      /style=/i,
      /<span/i,
      /<font/i,
      /class=/i,
      /<div/i,
      /<table/i,
    ];

    return riskyPatterns.some((pattern) => pattern.test(html));
  };

  const handleToggleMode = () => {
    // switching from HTML → Visual
    if (htmlMode) {
      if (hasRiskyStyles(form.body)) {
        setShowModeWarning(true);
        return;
      }
    }

    setHtmlMode((prev) => !prev);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center pt-0 gap-2 pb-4 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div>
        <h1 className="text-2xl font-semibold">Send Email</h1>
        <p className="text-sm text-muted-foreground">
          Compose and deliver email using your SMTP
        </p>
      </div>

      {apiError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
        </div>
      )}

      <EmailFormSection
        smtpList={smtpList}
        selectedSMTP={selectedSMTP}
        setSelectedSMTP={setSelectedSMTP}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
      />

      <MessageEditor
        body={form.body}
        setBody={(v) => setForm((prev) => ({ ...prev, body: v }))}
        subject={form.subject}
        setSubject={(v) => setForm((prev) => ({ ...prev, subject: v }))}
        error={errors.body}
        onPreview={() => setPreviewOpen(true)}
        htmlMode={htmlMode}
        onToggleMode={handleToggleMode}
        onChooseTemplate={() => setTemplateOpen(true)}
      />

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-6 py-2.5 rounded-md bg-primary text-secondry-foreground border border-btn-border flex items-center gap-2 hover:bg-primary/90 transition disabled:opacity-50"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {sending ? "Sending..." : "Send Email"}
        </button>
      </div>

      <TemplateModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        templates={templates}
        onSelect={applyTemplate}
      />

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={form}
      />

      <ModeWarningModal
        open={showModeWarning}
        onCancel={() => setShowModeWarning(false)}
        onConfirm={() => {
          setShowModeWarning(false);
          setHtmlMode(false);
        }}
      />
    </div>
  );
}
