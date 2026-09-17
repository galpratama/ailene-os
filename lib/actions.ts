"use server";

import { loginWithGoogle as loginWithGoogleApi } from "@/apis/auth";
import { logoutUser as logoutUserApi } from "@/apis/session";
import { isSuccessStatus } from "@/lib/status_code";

// The session JWT stays in the httpOnly cookie — the client only learns whether to navigate.
export async function loginWithGoogle(accessToken: string) {
  const result = await loginWithGoogleApi(accessToken);
  return { success: isSuccessStatus(result.status), message: result.message };
}

export async function logoutUser() {
  await logoutUserApi();
}
