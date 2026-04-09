"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type FormSummary = {
  id: string;
  name: string;
  slug: string;
};

type Submission = {
  id: string;
  form_id: string;
  form_name: string;
  form_slug: string;
  created_at: string;
  ip: string | null;
  user_agent: string | null;
  data: Record<string, unknown>;
};

type RangeValue = "all" | "1d" | "7d" | "30d" | "90d";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((entry) => formatValue(entry))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nestedValue]) => `${key}: ${formatValue(nestedValue)}`)
      .join("; ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function flattenSubmissionData(
  input: Record<string, unknown>,
  prefix = ""
): Array<{ key: string; value: string }> {
  const entries: Array<{ key: string; value: string }> = [];

  for (const [rawKey, rawValue] of Object.entries(input || {})) {
    const key = prefix ? `${prefix}.${rawKey}` : rawKey;

    if (Array.isArray(rawValue)) {
      const primitiveValues = rawValue.every(
        (item) => item === null || item === undefined || typeof item !== "object"
      );

      if (primitiveValues) {
        entries.push({ key, value: formatValue(rawValue) || "-" });
      } else {
        rawValue.forEach((item, index) => {
          if (item && typeof item === "object") {
            entries.push(...flattenSubmissionData(item as Record<string, unknown>, `${key}[${index}]`));
            return;
          }

          entries.push({ key: `${key}[${index}]`, value: formatValue(item) || "-" });
        });
      }

      continue;
    }

    if (rawValue && typeof rawValue === "object") {
      entries.push(...flattenSubmissionData(rawValue as Record<string, unknown>, key));
      continue;
    }

    entries.push({ key, value: formatValue(rawValue) || "-" });
  }

  return entries;
}

function sanitizeCsvCell(value: string) {
  const trimmed = value.trimStart();
  const needsNeutralize =
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@");

  const safeValue = needsNeutralize ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function maskIp(ip: string | null) {
  if (!ip) return "-";

  if (ip === "::1" || ip === "127.0.0.1") {
    return "Localhost";
  }

  if (ip.includes(":")) {
    const chunks = ip.split(":");
    if (chunks.length <= 2) return ip;
    return `${chunks.slice(0, 2).join(":")}:****`;
  }

  const parts = ip.split(".");
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.*.*`;
}

function buildCsvRows(submissions: Submission[]) {
  const headers = [
    "submission_id",
    "created_at",
    "form_id",
    "form_name",
    "form_slug",
    "ip",
    "user_agent",
    "field_names",
    "payload_text",
  ];

  const lines = [headers.map(sanitizeCsvCell).join(",")];

  submissions.forEach((submission) => {
    const flattened = flattenSubmissionData(submission.data || {});
    const fieldNames = flattened.map((entry) => entry.key).join(", ");
    const payloadText = flattened
      .map((entry) => `${entry.key}: ${entry.value}`)
      .join(" | ");

    const row: string[] = [
      submission.id,
      submission.created_at,
      submission.form_id,
      submission.form_name,
      submission.form_slug,
      submission.ip || "",
      submission.user_agent || "",
      fieldNames,
      payloadText,
    ];

    lines.push(row.map(sanitizeCsvCell).join(","));
  });

  return lines.join("\n");
}

export default function FormSubmissionsPage() {
  const { toast } = useToast();

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [selectedRange, setSelectedRange] = useState<RangeValue>("7d");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const hasSubmissions = submissions.length > 0;

  async function fetchSubmissions(
    formId = selectedFormId,
    range: RangeValue = selectedRange
  ) {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("limit", "300");
      params.set("range", range);
      if (formId !== "all") {
        params.set("formId", formId);
      }

      const response = await fetch(`/api/v1/forms/submissions?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load submissions");
      }

      setForms(Array.isArray(data?.forms) ? data.forms : []);
      setSubmissions(Array.isArray(data?.submissions) ? data.submissions : []);
    } catch (error) {
      toast({
        title: "Could not load submissions",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchSubmissions("all", "7d");
  }, []);

  async function handleFormFilterChange(nextFormId: string) {
    setSelectedFormId(nextFormId);
    await fetchSubmissions(nextFormId, selectedRange);
  }

  async function handleRangeFilterChange(nextRange: RangeValue) {
    setSelectedRange(nextRange);
    await fetchSubmissions(selectedFormId, nextRange);
  }

  function handleExportCsv() {
    if (!hasSubmissions) return;

    const csvContent = buildCsvRows(submissions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  const summaryText = useMemo(() => {
    if (selectedFormId === "all") {
      return `${submissions.length} submission${submissions.length === 1 ? "" : "s"} across all forms`;
    }

    const selectedForm = forms.find((form) => form.id === selectedFormId);
    if (!selectedForm) return `${submissions.length} submissions`;
    return `${submissions.length} submission${submissions.length === 1 ? "" : "s"} for ${selectedForm.name}`;
  }, [forms, selectedFormId, submissions.length]);

  const rangeLabel = useMemo(() => {
    if (selectedRange === "1d") return "last 24 hours";
    if (selectedRange === "7d") return "last 7 days";
    if (selectedRange === "30d") return "last 30 days";
    if (selectedRange === "90d") return "last 90 days";
    return "all time";
  }, [selectedRange]);

  const selectedSubmissionFields = useMemo(() => {
    if (!selectedSubmission) return [];
    return flattenSubmissionData(selectedSubmission.data || {});
  }, [selectedSubmission]);

  return (
    <div className="md:p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Form Submissions</h1>
          <p className="text-sm text-muted-foreground">{summaryText} ({rangeLabel})</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={selectedFormId}
            onValueChange={(value) => {
              void handleFormFilterChange(value);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedRange}
            onValueChange={(value) => {
              void handleRangeFilterChange(value as RangeValue);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            type="button"
            onClick={() => {
              void fetchSubmissions(selectedFormId, selectedRange);
            }}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>

          <Button
            variant="main"
            type="button"
            onClick={handleExportCsv}
            disabled={!hasSubmissions}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 md:p-5">
        {loading ? (
          <div className="space-y-2">
            <div className="h-12 rounded-md bg-muted animate-pulse" />
            <div className="h-12 rounded-md bg-muted animate-pulse" />
            <div className="h-12 rounded-md bg-muted animate-pulse" />
          </div>
        ) : !hasSubmissions ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No submissions found for this filter.
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      role="button"
                      className="cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <TableCell>{formatDate(submission.created_at)}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {submission.form_name}
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {Object.keys(submission.data).join(", ") || "-"}
                      </TableCell>
                      <TableCell>{maskIp(submission.ip)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedSubmission(submission);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {submissions.map((submission) => (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => setSelectedSubmission(submission)}
                  className="w-full rounded-lg border border-border/70 bg-background p-3 text-left"
                >
                  <p className="text-sm font-medium truncate">{submission.form_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(submission.created_at)}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    Fields: {Object.keys(submission.data).join(", ") || "-"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    IP: {maskIp(submission.ip)}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(selectedSubmission)}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission details</DialogTitle>
            <DialogDescription>
              {selectedSubmission
                ? `${selectedSubmission.form_name} • ${formatDate(selectedSubmission.created_at)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission ? (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  <span className="font-medium text-foreground">Submission ID:</span>{" "}
                  {selectedSubmission.id}
                </p>
                <p>
                  <span className="font-medium text-foreground">Form:</span>{" "}
                  {selectedSubmission.form_name}
                </p>
                <p>
                  <span className="font-medium text-foreground">IP:</span>{" "}
                  {maskIp(selectedSubmission.ip)}
                </p>
                <p className="truncate">
                  <span className="font-medium text-foreground">User-Agent:</span>{" "}
                  {selectedSubmission.user_agent || "-"}
                </p>
              </div>

              <div className="rounded-md border border-border bg-muted/20 p-3">
                <p className="mb-2 text-sm font-medium">Payload</p>
                {selectedSubmissionFields.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No fields captured.</p>
                ) : (
                  <div className="max-h-[360px] overflow-auto rounded-md border border-border/60 bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSubmissionFields.map((entry) => (
                          <TableRow key={`${entry.key}-${entry.value}`}>
                            <TableCell className="max-w-[180px] truncate text-xs font-medium">
                              {entry.key}
                            </TableCell>
                            <TableCell className="max-w-[420px] whitespace-normal break-words text-xs text-muted-foreground">
                              {entry.value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
