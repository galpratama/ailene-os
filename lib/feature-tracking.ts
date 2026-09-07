import { pushGTMEvent } from "@/lib/gtm";

// Every tracked block on the marketing site, ordered top to bottom — the index is feature_position.
export const BIZ_BLOCKS = [
  "header_announcement",
  "header",
  "header_mobile",
  "hero",
  "companies",
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

interface Feature {
  name: FeatureName;
  block: BizBlock;
}

// A block reports its view once per session, matching the reveal animation's `once`.
const viewedBlocks = new Set<BizBlock>();

function pushFeature(event: "view" | "click", feature: Feature) {
  pushGTMEvent(event, {
    feature_name: feature.name,
    feature_id: feature.block,
    feature_position: BIZ_BLOCKS.indexOf(feature.block) + 1,
  });
}

export function trackFeatureView(feature: Feature) {
  if (viewedBlocks.has(feature.block)) return;
  viewedBlocks.add(feature.block);
  pushFeature("view", feature);
}

export function trackFeatureClick(feature: Feature) {
  pushFeature("click", feature);
}
