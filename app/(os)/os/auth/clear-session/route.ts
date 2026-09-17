import { SESSION_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// A server component can't drop a cookie mid-render, so a stale token is bounced here — next.config exempts this path.
export async function GET(request: Request) {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    domain: getSessionCookieDomain(),
  });

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
