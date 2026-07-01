import { trpc } from "@/trpc/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const accessToken = body.tokenResponse.access_token;

  const loggedIn = await trpc.auth.login({ accessToken });
  const sessionToken = loggedIn.token.token;
  const user = loggedIn.registered_user;

  if (!sessionToken) {
    return NextResponse.json({ status: 500, message: "Failed" });
  }

  const domain =
    process.env.DOMAIN_MODE === "local" ? "example.com" : "ailene.id";

  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionToken, {
    domain,
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 365 * 10,
  });

  return NextResponse.json({
    status: 200,
    message: "Success",
    session_token: sessionToken,
    user: {
      id: user?.id,
      name: user?.full_name,
      email: user?.email,
      role: user?.role_id,
    },
  });
}
