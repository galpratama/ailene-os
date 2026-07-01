import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";

function getAllowedOriginHeader(origin: string | null): string | null {
  if (!origin) {
    // No Origin header = same-origin or non-browser request; allow, no ACAO header needed.
    return null;
  }

  const allowedOrigins =
    process.env.DOMAIN_MODE === "local"
      ? ["https://os.example.com:3000"]
      : ["https://os.ailene.id"];

  return allowedOrigins.includes(origin) ? origin : "";
}

// Preflight for cross-origin clients.
export async function OPTIONS(req: NextRequest) {
  const allowedOrigin = getAllowedOriginHeader(req.headers.get("origin"));
  if (allowedOrigin === "") {
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
  const allowedOrigin = getAllowedOriginHeader(req.headers.get("origin"));

  // Explicit wrong origin → reject.
  if (allowedOrigin === "") {
    return new NextResponse(null, { status: 404 });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    responseMeta({}) {
      return allowedOrigin
        ? { headers: { "Access-Control-Allow-Origin": allowedOrigin } }
        : {};
    },
  });
};

export { handler as GET, handler as POST };
