import type { AppSelectOption } from "@/components/fields/AppSelect";
import type { LeadChannel } from "@/apis/sales";

// Display names for the API's lead_channel values, grouped in the order the pickers list them.
export const LEAD_CHANNEL_LABELS: Record<LeadChannel, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  seo: "Organic Search (SEO)",
  direct: "Direct",
  organic_social: "Organic Social",
  ai_assistant: "AI Assistant",
  web_referral: "Website Referral",
  b2c_bridge: "B2C Bridge (ailene.id)",
  ref_raymond_chin: "Referral · Raymond Chin",
  ref_network: "Referral · Network",
  ref_client: "Referral · Client",
  out_raymond_db: "Outbound · Raymond Chin DB",
  out_linkedin: "Outbound · LinkedIn",
  out_threads: "Outbound · Threads",
  out_existing_bu: "Outbound · Existing BU",
  public_workshop: "Event · Public Workshop",
  webinar: "Event · Webinar",
  exhibition: "Event · Exhibition",
  expansion: "Expansion",
  referral: "Referral (legacy)",
  linkedin: "LinkedIn (legacy)",
  thread: "Thread (legacy)",
  instagram: "Instagram (legacy)",
  facebook: "Facebook (legacy)",
};

const LEGACY_CHANNELS: LeadChannel[] = ["referral", "linkedin", "thread", "instagram", "facebook"];

export function leadChannelLabel(channel: LeadChannel | null | undefined): string {
  return channel ? LEAD_CHANNEL_LABELS[channel] ?? channel : "—";
}

// Legacy values stay in filters and edits so existing rows still show; new leads pick from the taxonomy only.
export function buildLeadChannelOptions(emptyLabel: string, includeLegacy: boolean): AppSelectOption[] {
  const channels = (Object.keys(LEAD_CHANNEL_LABELS) as LeadChannel[]).filter(
    (channel) => includeLegacy || !LEGACY_CHANNELS.includes(channel)
  );
  return [
    { value: "", label: emptyLabel },
    ...channels.map((channel) => ({ value: channel, label: LEAD_CHANNEL_LABELS[channel] })),
  ];
}
