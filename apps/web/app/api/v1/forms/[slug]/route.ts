import { success, fail } from "@/lib/utils/api-response";
import { getFormBySlug } from "@/lib/services/forms.service";
import { normalizeFormSchema } from "@/lib/forms/normalize-schema";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const form = await getFormBySlug(slug);

    if (!form) {
      return fail("Form not found", "form_not_found", 404);
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

    return success({
      id: form.id,
      name: form.name,
      slug: form.slug,
      fields: parsedSchema.fields,
      settings: publicSettings,
    });
  } catch (e) {
    console.error("GET_FORM_ERROR", e);
    return fail("Internal server error", "internal_error", 500);
  }
}
