import "server-only";

import { callApi, clientSecret, type ApiEnvelope } from "./api";
import { isSuccessStatus } from "@/lib/status_code";
import { setSessionCookie, type SessionUser } from "./session";

export type LoginResult = {
  token: string;
  user: SessionUser;
};

// Exchanges a Google OAuth access token for our own session JWT, then stores it as the shared httpOnly cookie.
export async function loginWithGoogle(
  accessToken: string
): Promise<ApiEnvelope<LoginResult>> {
  const result = await callApi<LoginResult>("/api/v1/auth/login/google", {
    token: clientSecret(),
    body: { access_token: accessToken },
  });

  const token = result.data?.token;

  if (!isSuccessStatus(result.status) || !token) {
    return result;
  }

  await setSessionCookie(token);

  return result;
}
