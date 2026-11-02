import { sendLeadEvent } from "@/lib/fbq";
import { sendConversionEvent } from "@/lib/gtag";
import { pushGTMEvent } from "@/lib/gtm";
import { trackFeatureClick, type BizBlock } from "@/lib/feature-tracking";

type LeadMethod = "form" | "whatsapp";

// GA4's recommended lead event (key event in GA4), plus Google Ads and the Meta pixel.
function sendLead(method: LeadMethod, placement: BizBlock) {
  pushGTMEvent("generate_lead", { lead_source: method, feature_id: placement });
  sendConversionEvent();
  sendLeadEvent(method);
}

// The primary lead conversion: one click event, plus the lead event everywhere.
export function trackWhatsAppLead(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "whatsapp_cta", block: params.placement });
  sendLead("whatsapp", params.placement);
}

// A completed sales form counts as the same lead conversion as a WhatsApp CTA.
export function trackFormLead(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "form_submit", block: params.placement });
  sendLead("form", params.placement);
}

// Non-sales form submits: GTM only, so they never inflate the Ads/Meta lead count.
export function trackFormSubmit(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "form_submit", block: params.placement });
}

// Navigational CTAs (anchors, section jumps): funnel signal, not a conversion.
export function trackCTAClick(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "anchor_cta", block: params.placement });
}
