import { sendLeadEvent } from "@/lib/fbq";
import { sendConversionEvent } from "@/lib/gtag";
import { pushGTMEvent } from "@/lib/gtm";

// GTM/Ads segment on these strings — add new ones, don't rename existing ones.
export type ConversionPlacement =
  | "header_announcement"
  | "header"
  | "header_mobile"
  | "hero"
  | "adoption_proof"
  | "outcomes"
  | "programs"
  | "lead_form"
  | "final_cta"
  | "footer"
  | "trainer_application";

// The primary lead conversion: one dataLayer event, plus Google Ads and Meta.
export function trackWhatsAppLead(params: {
  placement: ConversionPlacement;
  label?: string;
}) {
  pushGTMEvent("generate_lead", {
    lead_source: "whatsapp",
    cta_placement: params.placement,
    cta_label: params.label,
  });
  sendConversionEvent();
  sendLeadEvent();
}

// A form that hands the visitor to sales counts as the same lead conversion.
export function trackFormLead(params: {
  formName: string;
  placement: ConversionPlacement;
}) {
  pushGTMEvent("generate_lead", {
    lead_source: "form",
    form_name: params.formName,
    cta_placement: params.placement,
  });
  sendConversionEvent();
  sendLeadEvent();
}

// Non-sales form submits: GTM only, so they never inflate the Ads/Meta lead count.
export function trackFormSubmit(params: {
  formName: string;
  placement: ConversionPlacement;
}) {
  pushGTMEvent("form_submit", {
    form_name: params.formName,
    cta_placement: params.placement,
  });
}

// Navigational CTAs (anchors, section jumps): funnel signal, not a conversion.
export function trackCTAClick(params: {
  label?: string;
  placement: ConversionPlacement;
  href?: string;
}) {
  pushGTMEvent("cta_click", {
    cta_label: params.label,
    cta_placement: params.placement,
    cta_destination: params.href,
  });
}
