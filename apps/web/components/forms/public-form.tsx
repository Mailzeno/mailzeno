"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicDateField, PublicTimeField } from "@/components/forms/public-date-time-fields";

type FormField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  condition?: {
    field: string;
    operator: "equals" | "not_equals" | "includes" | "not_includes";
    value: string;
  };
};

type FormSettings = {
  success_message?: string;
};

type PublicFormProps = {
  formId?: string;
  slug: string;
  name: string;
  fields: FormField[];
  settings?: FormSettings;
};

export function PublicForm({ formId, slug, name, fields, settings }: PublicFormProps) {
  const { toast } = useToast();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [choiceValues, setChoiceValues] = useState<Record<string, string | string[]>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClear() {
    setInputValues({});
    setChoiceValues({});
    setErrorMessage(null);
    if (status !== "submitting") {
      setStatus("idle");
    }
  }

  const successMessage =
    typeof settings?.success_message === "string" && settings.success_message.trim()
      ? settings.success_message
      : "Thanks! Your response has been submitted.";

  function getOptions(field: FormField) {
    return Array.isArray(field.options)
      ? field.options.map((option) => option.trim()).filter(Boolean)
      : [];
  }

  function setSingleChoice(name: string, value: string) {
    setChoiceValues((prev) => ({ ...prev, [name]: value }));
  }

  function setInputValue(name: string, value: string) {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  }

  function setMultiChoice(name: string, option: string, checked: boolean) {
    setChoiceValues((prev) => {
      const current = Array.isArray(prev[name]) ? prev[name] : [];
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((item) => item !== option);

      return { ...prev, [name]: next };
    });
  }

  function getCurrentValue(name: string) {
    const choiceValue = choiceValues[name];
    if (choiceValue !== undefined) return choiceValue;
    return inputValues[name] ?? "";
  }

  function isFieldVisible(field: FormField) {
    const condition = field.condition;
    if (!condition || !condition.field) return true;

    const current = getCurrentValue(condition.field);
    const currentValues = Array.isArray(current) ? current : [String(current)];
    const expected = condition.value ?? "";

    switch (condition.operator) {
      case "not_equals":
        return currentValues.every((value) => value !== expected);
      case "includes":
        return currentValues.some((value) => value === expected);
      case "not_includes":
        return currentValues.every((value) => value !== expected);
      case "equals":
      default:
        return (currentValues[0] ?? "") === expected;
    }
  }

  const visibleFields = useMemo(
    () => fields.filter((field) => isFieldVisible(field)),
    [fields, inputValues, choiceValues]
  );

  const visibleOptionFields = useMemo(
    () =>
      visibleFields.filter(
        (field) =>
          field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox"
      ),
    [visibleFields]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload: Record<string, string | string[]> = {};

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") continue;

      if (!(key in payload)) {
        payload[key] = value;
      } else {
        const existing = payload[key];
        payload[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      }
    }

    for (const field of visibleOptionFields) {
      const value = choiceValues[field.name];
      if (value !== undefined) {
        payload[field.name] = value;
      }
    }

    try {
      const res = await fetch(`/api/v1/forms/submit/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        const message = data?.error?.message || "Submission failed";
        setErrorMessage(message);
        setStatus("error");
        toast({
          title: "Submission failed",
          description: message,
          variant: "destructive",
        });
        return;
      }

      setStatus("success");
      formElement.reset();
      setInputValues({});
      setChoiceValues({});
      toast({
        title: "Submitted successfully",
        description: successMessage,
      });
    } catch (err) {
      setErrorMessage("Submission failed");
      setStatus("error");
      toast({
        title: "Submission failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl px-2 md:px-0">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold md:text-4xl">{name}</h1>
        <p className="text-sm text-muted-foreground">
          Fill the details below and we will get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        {formId ? (
          <input name="form_id" type="hidden" value={formId} />
        ) : null}

        <div className="rounded-3xl border border-border/70 bg-background p-6 md:p-8">
          {visibleFields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No fields available for the current selection.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === "textarea" ? "sm:col-span-2" : ""}
                >
                  <label className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      required={Boolean(field.required)}
                      placeholder={field.placeholder || field.label}
                      onChange={(event) => setInputValue(field.name, event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
                      rows={5}
                    />
                  ) : field.type === "select" ? (
                    <>
                      <Select
                        value={typeof choiceValues[field.name] === "string" ? (choiceValues[field.name] as string) : ""}
                        onValueChange={(value) => setSingleChoice(field.name, value)}
                      >
                        <SelectTrigger className="mt-2 h-11 rounded-2xl border-border bg-background px-4 text-sm">
                          <SelectValue
                            placeholder={field.placeholder || `Select ${field.label}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {getOptions(field).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name={field.name}
                        value={typeof choiceValues[field.name] === "string" ? (choiceValues[field.name] as string) : ""}
                      />
                    </>
                  ) : field.type === "radio" ? (
                    <>
                      <RadioGroup
                        className="mt-3"
                        value={typeof choiceValues[field.name] === "string" ? (choiceValues[field.name] as string) : ""}
                        onValueChange={(value) => setSingleChoice(field.name, value)}
                      >
                        {getOptions(field).map((option) => (
                          <label key={option} className="flex items-center gap-3 text-sm text-foreground/90">
                            <RadioGroupItem value={option} />
                            <span>{option}</span>
                          </label>
                        ))}
                      </RadioGroup>
                      <input
                        type="hidden"
                        name={field.name}
                        value={typeof choiceValues[field.name] === "string" ? (choiceValues[field.name] as string) : ""}
                      />
                    </>
                  ) : field.type === "checkbox" ? (
                    <>
                      <div className="mt-3 space-y-2">
                        {getOptions(field).map((option) => {
                          const selected = Array.isArray(choiceValues[field.name])
                            ? (choiceValues[field.name] as string[])
                            : [];
                          const checked = selected.includes(option);

                          return (
                            <label key={option} className="flex items-center gap-3 text-sm text-foreground/90">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  setMultiChoice(field.name, option, Boolean(value))
                                }
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      {Array.isArray(choiceValues[field.name])
                        ? (choiceValues[field.name] as string[]).map((value) => (
                            <input
                              key={`${field.name}-${value}`}
                              type="hidden"
                              name={field.name}
                              value={value}
                            />
                          ))
                        : null}
                    </>
                  ) : field.type === "date" ? (
                    <PublicDateField
                      name={field.name}
                      value={inputValues[field.name] ?? ""}
                      onChange={(value) => setInputValue(field.name, value)}
                      placeholder={field.placeholder || `Pick ${field.label}`}
                    />
                  ) : field.type === "time" ? (
                    <PublicTimeField
                      name={field.name}
                      value={inputValues[field.name] ?? ""}
                      onChange={(value) => setInputValue(field.name, value)}
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={
                        field.type === "email"
                          ? "email"
                          : field.type === "phone"
                            ? "tel"
                            : field.type || "text"
                      }
                      required={Boolean(field.required)}
                      placeholder={field.placeholder || field.label}
                      onChange={(event) => setInputValue(field.name, event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30"
                    />
                  )}

                  {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && getOptions(field).length === 0 ? (
                    <p className="mt-2 text-xs text-destructive">No options configured for this field.</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {status === "error" && errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={"main"}
            type="submit"
            disabled={status === "submitting" || visibleFields.length === 0}
            className="group relative min-w-[160px] overflow-hidden rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
          >
            <span className="relative z-10">
              {status === "submitting" ? "Submitting..." : "Submit"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-white/10 transition group-hover:translate-x-0" />
          </Button>
          <Button
            type="reset"
            variant="outline"
            onClick={handleClear}
            className="min-w-[140px] rounded-md border border-border px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            Clear
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Never submit passwords through mailzeno forms.
        </p>
      </form>

      <div className="mt-16 pb-10 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="text-2xl text-foreground/80 font-bold">MailZeno <span className="text-muted-foreground font-medium">Forms</span></div>
        <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/60 sm:inline-block" />
        <a
          href="https://mailzeno.dev"
          target="_blank"
          rel="noreferrer"
          className=" text-sm text-muted-foreground underline underline-offset-2 hover:underline"
        >
          Get your own form
        </a>
      </div>

      {status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-background p-6 text-center animate-in fade-in zoom-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 animate-in zoom-in" />
            </div>
            <h2 className="text-lg font-semibold">Response submitted</h2>
            <p className="mt-2 text-sm text-muted-foreground">{successMessage}</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Submit another response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
