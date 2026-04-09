import { success, fail } from "@/lib/utils/api-response";
import { getFormBySlug } from "@/lib/services/forms.service";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";

function buildCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");

  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  } as Record<string, string>;
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(req),
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const corsHeaders = buildCorsHeaders(req);
    const { slug } = await params;

    const form = await getFormBySlug(slug);

    if (!form) {
      return fail("Form not found", "form_not_found", 404, corsHeaders);
    }

    const parsedSchema = normalizeFormSchema(form.schema);

    let parsedSettings: Record<string, unknown> = {};
    if (typeof form.settings === "string") {
      try {
        const parsed = JSON.parse(form.settings);
        if (parsed && typeof parsed === "object") {
          parsedSettings = parsed as Record<string, unknown>;
        }
      } catch {
        parsedSettings = {};
      }
    } else if (form.settings && typeof form.settings === "object") {
      parsedSettings = form.settings as Record<string, unknown>;
    }

    const publicSettings = {
      success_message:
        typeof parsedSettings.success_message === "string"
          ? parsedSettings.success_message
          : undefined,
    };

    return success(
      {
        id: form.id,
        name: form.name,
        slug: form.slug,
        fields: parsedSchema.fields,
        settings: publicSettings,
      },
      200,
      corsHeaders
    );
  } catch (e) {
    console.error("GET_FORM_ERROR", e);
    return fail("Internal server error", "internal_error", 500, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    });
  }
}
