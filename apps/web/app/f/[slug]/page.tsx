import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { PublicForm } from "@/components/forms/public-form";

async function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") || "https";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

async function getForm(slug: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/v1/forms/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data.data || data;
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const form = await getForm(slug);

  if (!form) return notFound();

  const fields = Array.isArray(form.fields)
    ? form.fields
    : form.fields?.fields || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <PublicForm
        formId={form.id}
        slug={form.slug}
        name={form.name || form.slug.replace(/-/g, " ")}
        fields={fields}
        settings={form.settings}
      />
    </div>
  );
}
