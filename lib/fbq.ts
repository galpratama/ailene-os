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
