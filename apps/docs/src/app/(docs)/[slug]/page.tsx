import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, getDocBySlug } from "@/lib/mdx";


interface DocPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: DocPageProps): Promise<Metadata> {
    const { slug } = await params;
    const doc = getDocBySlug(slug);
    if (!doc) return {};

    return {
        title: doc.title,
        description: doc.description,
    };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;

  const doc = getDocBySlug(slug);
  if (!doc) notFound();


  let MDXContent: React.ComponentType;
  try {
    const mod = await import(`@content/docs/${slug}.mdx`);
    MDXContent = mod.default;
  } catch {
    notFound();
  }

  return (
    <article className="prose max-w-none">
      <MDXContent />

      {/* Pass headings to layout via context OR render here */}
      
    </article>
  );
}