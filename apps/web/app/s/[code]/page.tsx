import { notFound, redirect } from "next/navigation";
import { getFormByShortCode } from "@/lib/services/forms.service";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function ShortFormLinkPage({ params }: PageProps) {
  const { code } = await params;

  const form = await getFormByShortCode(code);

  if (!form?.slug) {
    return notFound();
  }

  redirect(`/f/${form.slug}`);
}
