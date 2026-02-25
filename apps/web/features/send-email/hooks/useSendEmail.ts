"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useToast } from "@/components/ui/use-toast";

type SMTP = {
  id: string;
  name: string;
  is_active: boolean;
};

type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

type FormErrors = {
  to?: string;
  subject?: string;
  body?: string;
  smtp?: string;
};

export function useSendEmail() {
  const { toast } = useToast();

  const [smtpList, setSmtpList] = useState<SMTP[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedSMTP, setSelectedSMTP] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const [scheduled, setScheduled] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string): boolean =>
    emailRegex.test(email.trim());

  const validateMultipleEmails = (emails: string): boolean => {
    if (!emails.trim()) return true;
    const emailList = emails.split(",").map((e) => e.trim());
    return emailList.every((email) => validateEmail(email));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedSMTP) newErrors.smtp = "Please select an SMTP account";

    if (!form.to.trim()) {
      newErrors.to = "Recipient email is required";
    } else if (!validateMultipleEmails(form.to)) {
      newErrors.to = "Invalid email format";
    }

    if (form.subject.trim() === "") newErrors.subject = "Subject is required";

    if (!form.body.trim() || form.body === "<p></p>")
      newErrors.body = "Message body is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchInitialData = async () => {
    try {
      setPageLoading(true);

      const [smtpRes, templateRes] = await Promise.all([
        fetch("/api/smtp"),
        fetch("/api/templates"),
      ]);

      if (!smtpRes.ok) throw new Error("Failed to fetch SMTP accounts");

      const smtpData = await smtpRes.json();
      setSmtpList(smtpData.data || []);

      const active = smtpData.data?.find((s: SMTP) => s.is_active);
      if (active) setSelectedSMTP(active.id);

      if (templateRes.ok) {
        const templateData = await templateRes.json();
        setTemplates(templateData.data || []);
      }
    } catch (error) {
      console.error(error);
      setApiError("Failed to load page data");
    } finally {
      setPageLoading(false);
    }
  };

 const handleSend = async () => {
  setApiError("");
  if (!validateForm()) return;

  setSending(true);

  try {
    const sanitizedBody = DOMPurify.sanitize(form.body, {
      FORBID_TAGS: ["script"],
      FORBID_ATTR: ["onerror", "onload"],
    });

    const payload = {
      smtpId: selectedSMTP,
      to: form.to.split(",").map((e) => e.trim()),
      subject: form.subject,
      html: sanitizedBody,
    };

    const res = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send email");
    }

    toast({
      title: "Email sent successfully ✅",
      description: "Your message has been delivered.",
    });

    setForm({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    });

    setErrors({});
  } catch (error) {
    setApiError(
      error instanceof Error ? error.message : "Failed to send email"
    );
  } finally {
    setSending(false);
  }
};


  useEffect(() => {
    fetchInitialData();
  }, []);

  return {
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
    scheduled,
    setScheduled,
  };
}
