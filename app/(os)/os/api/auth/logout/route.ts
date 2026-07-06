import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { trpc } from "@/trpc/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const domain =
    process.env.DOMAIN_MODE === "local" ? "example.com" : "ailene.id";

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await trpc.auth.logout({ token: sessionToken });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    domain,
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });

  return NextResponse.json({ status: 200, message: "Success" });
}
