import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

// The LinkedIn outreach agent's lead store: `ailene-os-apis/docs/api/outreach-leads.md`.

export type OutreachStatus =
  | "pending_approval"
  | "skipped"
  | "rejected"
  | "approved"
  | "invited"
  | "expired"
  | "connected"
  | "thanked"
  | "messaged"
  | "followed_up_1"
  | "followed_up_2"
  | "replied"
  | "disqualified"
  | "failed";

export type OutreachOrder = "next_action" | "fit_score" | "invited_at" | "updated_at";

export type OutreachLead = {
  id: number;
  campaign: string;
  urn_id: string;
  public_id: string;
  name: string;
  first_name: string;
  headline: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  summary: string;
  profile_url: string;
  distance: string;
  fit_score: number | null;
  fit_reason: string;
  status: OutreachStatus;
  next_action_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  invited_at: string | null;
  connected_at: string | null;
  thanked_at: string | null;
  messaged_at: string | null;
  followed_up_1_at: string | null;
  followed_up_2_at: string | null;
  replied_at: string | null;
  disqualified_at: string | null;
  last_checked_at: string | null;
  last_reply_check_at: string | null;
  alerted_at: string | null;
  approved_by: string | null;
  invite_with_note: boolean | null;
  invite_note: string;
  last_message: string;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export type OutreachEvent = {
  id: number;
  lead_id: number;
  event: string;
  from_status: OutreachStatus | null;
  to_status: OutreachStatus | null;
  detail: string;
  message: string;
  actor: string;
  created_at: string;
};

export type OutreachLeadDetails = OutreachLead & { events: OutreachEvent[] };

export type OutreachStats = {
  by_campaign: Record<string, Partial<Record<OutreachStatus, number>>>;
  approvals_today: { used: number; limit: number };
  acceptance: { sample: number; accepted: number };
};

export type ListOutreachLeadsOptions = {
  campaign?: string;
  statuses?: OutreachStatus[];
  due_only?: boolean;
  order?: OutreachOrder;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export type ApproveOutreachResult = { approved: OutreachLead[]; skipped: number[]; approvals_today: number; limit: number };

export type RejectOutreachResult = { rejected: number[]; skipped: number[] };

export async function listOutreachLeads(options: ListOutreachLeadsOptions = {}): Promise<ApiEnvelope<ApiList<OutreachLead>>> {
  return callApi("/api/v2/outreach-leads", { token: await getSessionToken(), body: options });
}

export async function getOutreachLeadDetails(id: number): Promise<ApiEnvelope<OutreachLeadDetails>> {
  return callApi("/api/v2/outreach-leads/details", { token: await getSessionToken(), body: { id } });
}

export async function getOutreachStats(): Promise<ApiEnvelope<OutreachStats>> {
  return callApi("/api/v2/outreach-leads/stats", { token: await getSessionToken(), body: {} });
}

export async function approveOutreachLeads(payload: { ids: number[]; with_note?: boolean | null }): Promise<ApiEnvelope<ApproveOutreachResult>> {
  return callApi("/api/v2/outreach-leads/approve", { token: await getSessionToken(), body: payload });
}

export async function rejectOutreachLeads(payload: { ids: number[]; reason?: string }): Promise<ApiEnvelope<RejectOutreachResult>> {
  return callApi("/api/v2/outreach-leads/reject", { token: await getSessionToken(), body: payload });
}
