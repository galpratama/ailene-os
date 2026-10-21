export const SESSION_COOKIE_NAME = "session_token_ailene";

export const COMPANY_NAME_PLACEHOLDER = "Enter company name";
export const COMPANY_WEBSITE_PLACEHOLDER = "https://example.com";

export const LEAD_FORM_PLACEHOLDERS = {
  fullName: "Enter full name",
  jobTitle: "e.g. HR Manager",
  phone: "+62 812 3456 7890",
  email: "name@company.com",
  legalIdentifier: "Enter legal identifier",
} as const;

// Session cookie domain per DOMAIN_MODE — bare, no leading dot, so os./api./biz. share one session.
export function getSessionCookieDomain(): string {
  return process.env.DOMAIN_MODE === "local" ? "example.com" : "ailene.id";
}

// Two roles, no roles table to list from — the access-role picker reads these.
export const USER_ROLE_OPTIONS = [
  { label: "Administrator", value: "administrator" },
  { label: "Member", value: "member" },
] as const;
