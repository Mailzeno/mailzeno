import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.mailzeno.dev/docs";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];

  const docPages = getAllSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...docPages];
}