import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function clampLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 200;
  return Math.min(1000, Math.max(1, Math.floor(parsed)));
}

function resolveRangeStart(range: string | null) {
  const now = new Date();

  if (range === "1d") {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }

  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (range === "90d") {
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const formIdParam = (url.searchParams.get("formId") || "").trim();
    const rangeParam = (url.searchParams.get("range") || "all").trim();
    const limit = clampLimit(url.searchParams.get("limit"));
    const rangeStartIso = resolveRangeStart(rangeParam);

    let formsQuery = supabase
      .from("forms")
      .select("id, name, slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (formIdParam) {
      formsQuery = formsQuery.eq("id", formIdParam);
    }

    const { data: forms, error: formsError } = await formsQuery;

    if (formsError) {
      return NextResponse.json({ error: formsError.message }, { status: 400 });
    }

    const formList = forms ?? [];
    const formIds = formList.map((form) => form.id).filter(Boolean);

    if (formIds.length === 0) {
      return NextResponse.json({ submissions: [], forms: formList });
    }

    let submissionsQuery = supabase
      .from("form_submissions")
      .select("id, form_id, data, ip, user_agent, created_at")
      .in("form_id", formIds)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (rangeStartIso) {
      submissionsQuery = submissionsQuery.gte("created_at", rangeStartIso);
    }

    const { data: submissions, error: submissionsError } = await submissionsQuery;

    if (submissionsError) {
      return NextResponse.json({ error: submissionsError.message }, { status: 400 });
    }

    const formsById = new Map(formList.map((form) => [form.id, form]));

    const normalizedSubmissions = (submissions ?? []).map((submission) => {
      const form = formsById.get(submission.form_id);

      return {
        id: submission.id,
        form_id: submission.form_id,
        form_name: form?.name || "Unknown form",
        form_slug: form?.slug || "",
        created_at: submission.created_at,
        ip: submission.ip,
        user_agent: submission.user_agent,
        data:
          submission.data && typeof submission.data === "object"
            ? submission.data
            : {},
      };
    });

    return NextResponse.json({
      submissions: normalizedSubmissions,
      forms: formList,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
