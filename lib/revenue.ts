import type { IntakeMethod, LeadGroup } from "@/apis/revenue";
import { getShortRupiahCurrency } from "@/lib/currency";

export const PENDING_LABEL = "(Backend belum siap)";

// What a pending widget waits for: backend work, or an integration parked for later.
export type PendingBlocker = "backend" | "whatsapp";

export const leadGroups: LeadGroup[] = ["inbound_organic", "inbound_paid", "inbound_unknown", "outbound_referral", "outbound_outreach"];

export const leadGroupLabels: Record<LeadGroup, string> = {
  inbound_organic: "Inbound, organic",
  inbound_paid: "Inbound, paid",
  inbound_unknown: "Inbound, source unknown",
  outbound_referral: "Outbound, referral",
  outbound_outreach: "Outbound, outreach",
};

export const intakeMethodLabels: Record<IntakeMethod, string> = {
  website_form: "Website form leads in OS",
  meta_form: "Meta form leads in OS",
  manual: "Staff-created leads in OS",
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

export function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export type RevenueRangePreset = "7d" | "14d" | "30d" | "3m" | "6m";

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftMonths(value: string, months: number) {
  const [year, month, day] = value.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(day, lastDay));
  return first.toISOString().slice(0, 10);
}

export function revenuePresetRange(preset: RevenueRangePreset, today: string) {
  const start = preset === "3m" || preset === "6m"
    ? shiftDate(shiftMonths(today, preset === "3m" ? -3 : -6), 1)
    : shiftDate(today, 1 - Number.parseInt(preset, 10));
  return { start_date: start, end_date: today };
}

export function revenueRangeError(start: string, end: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return "Choose both dates.";
  if ([start, end].some((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value;
  })) return "Choose valid calendar dates.";
  if (end < start) return "End date must be on or after start date.";
  const days = Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000) + 1;
  if (!Number.isFinite(days) || days > 366) return "Choose a range of up to 366 days.";
  return "";
}

export function revenuePeriodLabel(start: string, end: string) {
  const format = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${format(start)} – ${format(end)}`;
}

export function monthName(value: string) {
  return new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function periodCaption(start: string, end: string) {
  return revenuePeriodLabel(start, end);
}
