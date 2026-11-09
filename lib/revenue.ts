import type { LeadGroup } from "@/apis/revenue";
import { getShortRupiahCurrency } from "@/lib/currency";

export const PENDING_LABEL = "(Backend belum siap)";

export const leadGroups: LeadGroup[] = ["inbound_organic", "inbound_paid", "inbound_unknown", "outbound_referral", "outbound_outreach"];

export const leadGroupLabels: Record<LeadGroup, string> = {
  inbound_organic: "Inbound, organic",
  inbound_paid: "Inbound, paid",
  inbound_unknown: "Inbound, source unknown",
  outbound_referral: "Outbound, referral",
  outbound_outreach: "Outbound, outreach",
};

export const leadGroupShortLabels: Record<LeadGroup, string> = {
  inbound_organic: "Organic",
  inbound_paid: "Paid",
  inbound_unknown: "Source unknown",
  outbound_referral: "Referral",
  outbound_outreach: "Outreach",
};

// A source keeps the same categorical color through the cards, the sankey, and the weekly bars.
export const leadGroupColors: Record<LeadGroup, string> = {
  inbound_organic: "var(--viz-4)",
  inbound_paid: "var(--viz-3)",
  inbound_unknown: "var(--viz-other)",
  outbound_referral: "var(--viz-1)",
  outbound_outreach: "var(--viz-5)",
};

const channelLabels: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  seo: "SEO",
  direct: "Direct",
  organic_social: "Organic social",
  ai_assistant: "AI assistant",
  web_referral: "Web referral",
  b2c_bridge: "B2C bridge",
  referral: "Referral",
  ref_raymond_chin: "Raymond Chin referral",
  ref_network: "Network referral",
  ref_client: "Client referral",
  out_raymond_db: "Raymond Chin DB outreach",
  out_linkedin: "LinkedIn outreach",
  out_threads: "Threads outreach",
  out_existing_bu: "Existing BU outreach",
  public_workshop: "Public workshop",
  webinar: "Webinar",
  exhibition: "Exhibition",
  expansion: "Expansion",
  linkedin: "LinkedIn",
  thread: "Threads",
  instagram: "Instagram",
  facebook: "Facebook",
};

export function channelLabel(channel: string | null) {
  if (!channel) return "No channel";
  return channelLabels[channel] ?? channel.replaceAll("_", " ");
}

export function money(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : getShortRupiahCurrency(value);
}

export function percent(value: number | null | undefined, digits = 0) {
  return value === null || value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;
}

export function count(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-US").format(value);
}

export type RevenueMonth = { key: string; label: string; start: string; end: string; partial: boolean };

function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

// The current month runs to today in Asia/Jakarta; earlier months are whole.
export function revenueMonths(count = 12): RevenueMonth[] {
  const today = jakartaToday();
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const first = new Date(Date.UTC(year, month - 1 - index, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
    const start = first.toISOString().slice(0, 10);
    const lastDay = last.toISOString().slice(0, 10);
    const end = index === 0 ? today : lastDay;
    const label = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
    return { key: start.slice(0, 7), label: index === 0 ? `${label} (to date)` : label, start, end, partial: end !== lastDay };
  });
}

export function monthName(value: string) {
  return new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function periodCaption(start: string, end: string) {
  return `${shortDate(start)} – ${shortDate(end)}`;
}
