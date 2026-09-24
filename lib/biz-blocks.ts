// Marketing site blocks in page order (index = feature_position); split from feature-tracking.ts so the server can import it.
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
] as const;

export type BizBlock = (typeof BIZ_BLOCKS)[number];

// What kind of element fired the event; feature_id says which block it sits in.
export type FeatureName =
  | "home_section"
  | "whatsapp_cta"
  | "anchor_cta"
  | "form_submit";

// A click on either of these hands the visitor to sales — together they are the lead count.
export const BIZ_LEAD_FEATURES: FeatureName[] = ["whatsapp_cta", "form_submit"];

// Landing page content sections in scroll order — the blocks HomePageBIZ passes to RevealOnScroll.
export const BIZ_SCROLL_BLOCKS: BizBlock[] = [
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
];

export const BIZ_FEATURE_LABELS: Record<FeatureName, string> = {
  home_section: "Section view",
  anchor_cta: "Navigation CTA",
  whatsapp_cta: "WhatsApp CTA",
  form_submit: "Form submit",
};

// Reader-friendly names for the OS analytics tab; one entry per BIZ_BLOCKS value.
export const BIZ_BLOCK_LABELS: Record<BizBlock, string> = {
  header_announcement: "Announcement bar",
  header: "Header",
  header_mobile: "Header (mobile)",
  hero: "Hero",
  companies: "Client logos",
  solution: "Solution",
  outcomes: "Outcomes",
  tools: "Tools",
  adoption_proof: "Adoption proof",
  lms: "LMS",
  curriculum: "Curriculum",
  programs: "Programs",
  trainers: "Trainers",
  faq: "FAQ",
  lead_form: "Lead form",
  final_cta: "Final CTA",
  footer: "Footer",
  footer_nav: "Footer nav",
  trainer_application: "Trainer application",
};
