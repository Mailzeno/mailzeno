// next.config.js
const { execSync } = require("child_process");
const pkg = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  async redirects() {
    return [
      {
        source: "/docs",
        destination: "https://docs.mailzeno.dev",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "https://docs.mailzeno.dev/:path*",
        permanent: true,
      },
    ];
  },

  env: {
    APP_NAME: pkg.name,
    APP_VERSION: pkg.version,
    APP_COMMIT: (() => {
      try {
        return execSync("git rev-parse --short HEAD").toString().trim();
      } catch {
        return "unknown";
      }
    })(),
    APP_BUILD_DATE: new Date().toISOString(),
  },
};

module.exports = nextConfig;