import type { LeadAttribution } from "@/apis/sales";

const STORAGE_KEY = "ailene_first_touch";
const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const CAMPAIGN_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CLICK_ID_PARAMS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;

type StoredTouch = LeadAttribution & { expires_at: number };

function hasSignal(touch: LeadAttribution): boolean {
  return [...CAMPAIGN_PARAMS, ...CLICK_ID_PARAMS, "referrer" as const].some((key) => Boolean(touch[key]));
}

function readStored(): StoredTouch | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const touch = JSON.parse(raw) as StoredTouch;
  return touch.expires_at > Date.now() ? touch : null;
}

// Another site's address without its query string; same-site navigation is not a referrer.
function externalReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  const referrer = new URL(document.referrer);
  if (referrer.hostname === window.location.hostname) return undefined;
  return `${referrer.origin}${referrer.pathname}`.slice(0, 2048);
}

// First marketing touch wins for 90 days; a stored direct visit gives way to a later campaign or referral.
export function captureAttribution() {
  try {
    const url = new URL(window.location.href);
    const touch: LeadAttribution = {};
    for (const key of CAMPAIGN_PARAMS) {
      const value = url.searchParams.get(key)?.trim();
      if (value) touch[key] = value.slice(0, 255);
    }
    for (const key of CLICK_ID_PARAMS) {
      const value = url.searchParams.get(key)?.trim();
      if (value) touch[key] = value.slice(0, 512);
    }
    const referrer = externalReferrer();
    if (referrer) touch.referrer = referrer;

    const stored = readStored();
    if (stored && (hasSignal(stored) || !hasSignal(touch))) return;
    touch.landing_page = url.pathname.slice(0, 2048);
    touch.first_seen_at = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...touch, expires_at: Date.now() + TTL_MS }));
  } catch {
    // Blocked storage or a malformed referrer only loses attribution, never the visit.
  }
}

export function readAttribution(): LeadAttribution | null {
  try {
    const stored: Partial<StoredTouch> | null = readStored();
    if (!stored) return null;
    delete stored.expires_at;
    return stored;
  } catch {
    return null;
  }
}
