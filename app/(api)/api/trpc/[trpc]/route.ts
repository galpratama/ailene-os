import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";

const isOriginAllowed = (origin: string | null) => {
  if (!origin) {
    return null;
  }

  const domainMode = process.env.DOMAIN_MODE;
  let baseURL = "ailene.id";
  if (domainMode === "local") {
    baseURL = "example.com:3000";
  }

  const allowedOrigins = [
    `https://os.${baseURL}`,
    `https://api.${baseURL}`,
    `https://biz.${baseURL}`,
    `https://${baseURL}`,
  ];

  if (allowedOrigins.includes(origin)) {
    return origin;
  }
  return false;
};

// Preflight for cross-origin clients.
export async function OPTIONS(req: NextRequest) {
  const allowedOrigin = isOriginAllowed(req.headers.get("origin"));
  if (allowedOrigin === false) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...(allowedOrigin && { "Access-Control-Allow-Origin": allowedOrigin }),
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

const handler = (req: Request) => {
  const isAllowed = isOriginAllowed(req.headers.get("origin"));
  // isAllowed is `false` only when an Origin header is present and not on the
  // allowlist. `null` means no Origin header at all (same-origin requests
  // usually omit it), which must be allowed through.
  if (isAllowed === false) {
    return new NextResponse(null, {
      status: 404, // Not Found
    });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    responseMeta({}) {
      return {
        headers: {
          ...(isAllowed && { "Access-Control-Allow-Origin": isAllowed }),
        },
      };
    },
  });
};

export { handler as GET, handler as POST };
