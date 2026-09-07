import { sendLeadEvent } from "@/lib/fbq";
import { sendConversionEvent } from "@/lib/gtag";
import { trackFeatureClick, type BizBlock } from "@/lib/feature-tracking";

// The primary lead conversion: one click event, plus Google Ads and Meta.
export function trackWhatsAppLead(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "whatsapp_cta", block: params.placement });
  sendConversionEvent();
  sendLeadEvent();
}

// A form that hands the visitor to sales counts as the same lead conversion.
export function trackFormLead(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "form_submit", block: params.placement });
  sendConversionEvent();
  sendLeadEvent();
}

// Non-sales form submits: GTM only, so they never inflate the Ads/Meta lead count.
export function trackFormSubmit(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "form_submit", block: params.placement });
}

// Navigational CTAs (anchors, section jumps): funnel signal, not a conversion.
export function trackCTAClick(params: { placement: BizBlock }) {
  trackFeatureClick({ name: "anchor_cta", block: params.placement });
}
