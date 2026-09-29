declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Google Ads "Submit lead form" conversion (ID/label), hardcoded like the tag ID in GoogleAdsTagBIZ.
const CONVERSION_SEND_TO = "AW-18418654652/DckgCKuBs4odELy72c5E";

export function sendConversionEvent() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "conversion", { send_to: CONVERSION_SEND_TO });
}
