declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// No-op until BD/Marketing supplies NEXT_PUBLIC_META_PIXEL_ID.
export function sendLeadEvent() {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "Lead");
}

// Meta's standard event list has no view/click equivalent, so the feature schema rides on custom events.
const FEATURE_EVENT_NAMES = {
  view: "FeatureView",
  click: "FeatureClick",
} as const;

// Same payload keys as the GTM push, so both dashboards read one taxonomy.
export function sendFeatureEvent(
  event: keyof typeof FEATURE_EVENT_NAMES,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", FEATURE_EVENT_NAMES[event], payload);
}
