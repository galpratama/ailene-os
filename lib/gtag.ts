declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Existing Google Ads "Submit lead form" conversion; replace when the new action's label is available.
const CONVERSION_SEND_TO = "AW-18418654652/DckgCKuBs4odELy72c5E";

export function sendConversionEvent() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: CONVERSION_SEND_TO });
}
