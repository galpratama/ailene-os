// Marketing site block IDs; index = feature_position, so append only. Labels and scroll order live in the API's MarketingSite.
export const BIZ_BLOCKS = [
  "header_announcement",
  "header",
  "header_mobile",
  "hero",
  "companies",
  "solution",
  "outcomes",
  "tools",
  "adoption_proof",
  "lms",
  "curriculum",
  "programs",
  "trainers",
  "faq",
  "lead_form",
  "final_cta",
  "footer",
  "footer_nav",
  "trainer_application",
  "documentation",
] as const;

export type BizBlock = (typeof BIZ_BLOCKS)[number];

// What kind of element fired the event; feature_id says which block it sits in.
export type FeatureName =
  | "home_section"
  | "whatsapp_cta"
  | "anchor_cta"
  | "form_submit";
