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

  transpilePackages: ['@mailzeno/core', '@mailzeno/client'],

  async redirects() {
    return [
      {
        source: "/f/:path*",
        has: [{ type: "host", value: "forms.mz" }],
        destination: "https://mailzeno.dev/f/:path*",
        permanent: true,
      },
      {
        source: "/f/:path*",
        has: [{ type: "host", value: "www.forms.mz" }],
        destination: "https://mailzeno.dev/f/:path*",
        permanent: true,
      },
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

  // api proxy
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: "/api/v1/:path*",
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