import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import { SESSION_COOKIE_NAME, getSessionCookieDomain } from "@/lib/constants";
import { STATUS_OK, isSuccessStatus } from "@/lib/status_code";
import { cookies } from "next/headers";
import { cache } from "react";

export type SessionRole = "ADMINISTRATOR" | "MEMBER";

export type SessionDataScope = "OWN" | "TEAM" | "GLOBAL";

export type SessionUserStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "ARCHIVED";

export type SessionUser = {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: SessionRole;
  status: SessionUserStatus;
  team_id: number | null;
  data_scope: SessionDataScope;
};

// The API serves the DB spelling (`own`), the app compares against Prisma's enum name (`OWN`) — bridge it here, not at 15 call sites.
type ApiSessionUser = Omit<SessionUser, "role" | "status" | "data_scope"> & {
  role: string;
  status: string;
  data_scope: string;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10;

function toSessionUser(user: ApiSessionUser): SessionUser {
  return {
    ...user,
    role: user.role.toUpperCase() as SessionRole,
    status: user.status.toUpperCase() as SessionUserStatus,
    data_scope: user.data_scope.toUpperCase() as SessionDataScope,
  };
}

// The one place the session cookie is written — every login path goes through it.
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    domain: getSessionCookieDomain(),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Cached per request so a layout and its pages share one check-session round trip.
export const getSession = cache(async () => {
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return { sessionToken: undefined, user: null };
  }

  const result = await callApi<{ user: ApiSessionUser }>(
    "/api/v1/auth/check-session",
    { token: sessionToken }
  );

  if (!isSuccessStatus(result.status) || !result.data?.user) {
    return { sessionToken: undefined, user: null };
  }

  return { sessionToken, user: toSessionUser(result.data.user) };
});

// Clears the cookie regardless of whether the backend logout call succeeds.
export async function logoutUser(): Promise<ApiEnvelope> {
  const sessionToken = await getSessionToken();

  const result = sessionToken
    ? await callApi("/api/v1/auth/logout", { token: sessionToken })
    : { status: STATUS_OK, message: "Already logged out" };

  const cookieStore = await cookies();
  cookieStore.delete({
    name: SESSION_COOKIE_NAME,
    domain: getSessionCookieDomain(),
  });

  return result;
}
