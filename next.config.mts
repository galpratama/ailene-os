import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SESSION_TOKEN = "session_token_ailene";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        // Force revalidation on the marketing domains so a cookie-dependent response never gets served stale.
        source: "/:all*",
        has: [
          {
            type: "header",
            key: "host",
            value: "biz.(ailene.id|example.com).*",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // No session cookie on os (prod) -> bounce to the login page on the main domain.
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "os.ailene.id.*",
          },
        ],
        missing: [
          {
            type: "cookie",
            key: SESSION_TOKEN,
          },
        ],
        destination: "https://biz.ailene.id/auth/login",
        basePath: false,
        permanent: false,
      },
      // Same, but for the local dev host running on :3000.
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "os.example.com:3000.*",
          },
        ],
        missing: [
          {
            type: "cookie",
            key: SESSION_TOKEN,
          },
        ],
        destination: "https://biz.example.com:3000/auth/login",
        basePath: false,
        permanent: false,
      },
      // Already signed in -> don't show the login page again.
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "biz.(ailene.id|example.com).*",
          },
          {
            type: "cookie",
            key: SESSION_TOKEN,
          },
        ],
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Prevent direct path access to route group directories.
        {
          source: "/(os|api|biz)",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // Any subdomain (os.ailene.id, api.ailene.id, tenant.ailene.id, ...) -> route into its matching folder.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(?<subdomain>[^.]+).(ailene.id|example.com).*",
            },
          ],
          destination: "/:subdomain/:path*",
        },
        // Bare apex domain -> the marketing site.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(ailene.id|example.com).*",
            },
          ],
          destination: "/biz/:path*",
        },
      ],
    };
  },
  // Let local dev subdomains (biz.example.com, tenant.example.com, ...) talk to this dev server (CORS for HMR etc.).
  allowedDevOrigins: ["biz.example.com", "*.example.com"],
  experimental: {
    serverActions: {
      // Only accept Server Action submissions from the known hosts.
      allowedOrigins: [
        "ailene.id",
        "*.ailene.id",
        "example.com",
        "*.example.com",
      ],
    },
  },
};

export default nextConfig;
