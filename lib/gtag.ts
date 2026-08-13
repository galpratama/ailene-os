declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Full "AW-XXXXXXXXX/Label" string from the conversion action's Google Ads setup page.
const CONVERSION_SEND_TO = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_SEND_TO;

// No-op until BD/Marketing supplies NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_SEND_TO.
export function sendConversionEvent() {
  if (typeof window === "undefined" || !window.gtag || !CONVERSION_SEND_TO) return;
  window.gtag("event", "conversion", { send_to: CONVERSION_SEND_TO });
}
