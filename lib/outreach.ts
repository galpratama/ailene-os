import type { OutreachLead, OutreachStatus } from "@/apis/outreach";
import type { LabelVariant } from "@/components/labels/Label";

export const outreachStatusStyles: Record<OutreachStatus, { variant: LabelVariant; label: string }> = {
  pending_approval: { variant: "kuning", label: "Pending approval" },
  skipped: { variant: "gray", label: "Skipped" },
  rejected: { variant: "merah", label: "Rejected" },
  approved: { variant: "biru", label: "Approved" },
  invited: { variant: "ungu", label: "Invited" },
  expired: { variant: "gray", label: "Invite expired" },
  connected: { variant: "toska", label: "Connected" },
  thanked: { variant: "toska", label: "Thanked" },
  messaged: { variant: "biru", label: "Messaged" },
  followed_up_1: { variant: "oranye", label: "Follow-up 1" },
  followed_up_2: { variant: "oranye", label: "Follow-up 2" },
  replied: { variant: "hijau", label: "Replied" },
  disqualified: { variant: "merah", label: "Disqualified" },
  failed: { variant: "merah", label: "Failed" },
};

export const outreachStatuses = Object.keys(outreachStatusStyles) as OutreachStatus[];

// Staff may approve these (the API moves them to approved) and reject those.
export const approvableStatuses: OutreachStatus[] = ["pending_approval", "skipped", "rejected"];
export const rejectableStatuses: OutreachStatus[] = ["pending_approval", "skipped", "approved"];

export const inSequenceStatuses: OutreachStatus[] = ["invited", "connected", "thanked", "messaged", "followed_up_1", "followed_up_2"];
export const closedStatuses: OutreachStatus[] = ["skipped", "rejected", "expired", "disqualified", "failed"];

export type OutreachView = "approval" | "approved" | "sequence" | "replied" | "closed" | "all";

export const outreachViews: { value: OutreachView; label: string; statuses: OutreachStatus[] }[] = [
  { value: "approval", label: "Needs approval", statuses: ["pending_approval"] },
  { value: "approved", label: "Approved queue", statuses: ["approved"] },
  { value: "sequence", label: "In sequence", statuses: inSequenceStatuses },
  { value: "replied", label: "Replied", statuses: ["replied"] },
  { value: "closed", label: "Closed", statuses: closedStatuses },
  { value: "all", label: "All", statuses: [] },
];

// A lead's current status implies the steps it passed; disqualified and failed can stop anywhere, so they count only as found.
const reachedSteps: Partial<Record<OutreachStatus, number>> = {
  pending_approval: 0, skipped: 0, rejected: 0, disqualified: 0, failed: 0,
  approved: 1, invited: 2, expired: 2, connected: 3, thanked: 3, messaged: 4, followed_up_1: 4, followed_up_2: 4, replied: 5,
};

export const funnelSteps = ["Found", "Approved", "Invited", "Connected", "Messaged", "Replied"];

export function outreachFunnel(counts: Partial<Record<OutreachStatus, number>>) {
  const totals = funnelSteps.map(() => 0);
  for (const [status, value] of Object.entries(counts) as [OutreachStatus, number][]) {
    const reached = reachedSteps[status] ?? 0;
    for (let step = 0; step <= reached; step++) totals[step] += value;
  }
  return totals;
}

export function sumStatuses(counts: Partial<Record<OutreachStatus, number>>, statuses: OutreachStatus[]) {
  return statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
}

export function mergeCampaignCounts(byCampaign: Record<string, Partial<Record<OutreachStatus, number>>>, campaign: string) {
  const merged: Partial<Record<OutreachStatus, number>> = {};
  for (const [name, counts] of Object.entries(byCampaign)) {
    if (campaign && name !== campaign) continue;
    for (const [status, value] of Object.entries(counts) as [OutreachStatus, number][]) {
      merged[status] = (merged[status] ?? 0) + value;
    }
  }
  return merged;
}

export function leadDisplayName(lead: Pick<OutreachLead, "name" | "public_id" | "urn_id">) {
  return lead.name || lead.public_id || lead.urn_id;
}

export function jakartaDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return `${new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" })} WIB`;
}

export function relativeFromNow(value: string | null | undefined) {
  if (!value) return "—";
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60_000);
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return format.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return format.format(hours, "hour");
  return format.format(Math.round(hours / 24), "day");
}
