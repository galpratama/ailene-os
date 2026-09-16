import {
  BIZ_BLOCKS,
  type BizBlock,
  type FeatureName,
} from "@/lib/biz-blocks";
import { sendFeatureEvent } from "@/lib/fbq";
import { pushGTMEvent } from "@/lib/gtm";

// The taxonomy lives in lib/biz-blocks.ts so the OS analytics router can read it too.
export { BIZ_BLOCKS };
export type { BizBlock, FeatureName };

interface Feature {
  name: FeatureName;
  block: BizBlock;
}

// A block reports its view once per session, matching the reveal animation's `once`.
const viewedBlocks = new Set<BizBlock>();

// One payload, two destinations: GA4 through GTM and the Meta pixel.
function pushFeature(event: "view" | "click", feature: Feature) {
  const payload = {
    feature_name: feature.name,
    feature_id: feature.block,
    feature_position: BIZ_BLOCKS.indexOf(feature.block) + 1,
  };

  pushGTMEvent(event, payload);
  sendFeatureEvent(event, payload);
}

export function trackFeatureView(feature: Feature) {
  if (viewedBlocks.has(feature.block)) return;
  viewedBlocks.add(feature.block);
  pushFeature("view", feature);
}

export function trackFeatureClick(feature: Feature) {
  pushFeature("click", feature);
}
