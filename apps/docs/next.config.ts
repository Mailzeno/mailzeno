import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  async redirects() {
    return [
      {
        source: "/app",
        destination: "https://mailzeno.dev",
        permanent: true,
      },
      {
        source: "/app/:path*",
        destination: "https://mailzeno.dev",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [["rehype-slug"]],
  },
});

export default withMDX(nextConfig);