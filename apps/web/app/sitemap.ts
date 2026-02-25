import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mailzeno.dev",
      lastModified: new Date(),
    },
    {
      url: "https://mailzeno.dev/pricing",
      lastModified: new Date(),
    },
    {
      url: "https://mailzeno.dev/docs",
      lastModified: new Date(),
    },
  ];
}