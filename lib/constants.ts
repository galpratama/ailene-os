export const SESSION_COOKIE_NAME = "session_token_ailene";

// Session cookie domain per DOMAIN_MODE — bare, no leading dot, so os./api./biz. share one session.
export function getSessionCookieDomain(): string {
  return process.env.DOMAIN_MODE === "local" ? "example.com" : "ailene.id";
}

// Two roles, no roles table to list from — the access-role picker reads these.
export const USER_ROLE_OPTIONS = [
  { label: "Administrator", value: "ADMINISTRATOR" },
  { label: "Member", value: "MEMBER" },
] as const;
