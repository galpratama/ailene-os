import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        source: "/:all*",
        has: [
          {
            type: "header",
            key: "host",
            value: "os.(ailene.id|example.com).*",
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
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "os.(ailene.id|example.com).*",
          },
          {
            type: "cookie",
            key: "session_token",
            value: undefined,
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
          source: "/(os|api)",
          destination: "/_not-found/page",
        },
        // Route root "/" to not-found when accessed via the api.* host.
        {
          source: "/",
          has: [
            {
              type: "header",
              key: "host",
              value: "api.(ailene.id|example.com).*",
            },
          ],
          destination: "/_not-found/page",
        },
        // Route root "/" to "/os" when accessed via the os.* host.
        {
          source: "/",
          has: [
            {
              type: "header",
              key: "host",
              value: "os.(ailene.id|example.com).*",
            },
          ],
          destination: "/os",
        },
      ],
      afterFiles: [
        // Route os.ailene.id/:path* → /os/:path*
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "os.(ailene.id|example.com).*",
            },
          ],
          destination: "/os/:path*",
        },
      ],
    };
  },
  allowedDevOrigins: ["os.example.com"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "os.ailene.id",
        "os.example.com",
      ],
    },
  },
};

export default nextConfig;
