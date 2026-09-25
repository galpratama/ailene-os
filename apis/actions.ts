import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type ActionStatus = "to_do" | "in_progress" | "review" | "done";
export type ActionPriority = "low" | "medium" | "high" | "urgent";

export type ActionData = {
  id: number;
  name: string;
  summary: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  due_date: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  source_meeting_id: number | null;
  created_at: string;
  updated_at: string;
};

export type ListActionsOptions = {
  keyword?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  assignee_id?: string;
  // Both bounds are inclusive YYYY-MM-DD due dates.
  due_from?: string;
  due_to?: string;
  page?: number;
  page_size?: number;
};

// Omitting assignee_id lets the API pick: the caller for own/team scope, unassigned for global.
export type CreateActionPayload = {
  name: string;
  summary?: string | null;
  status?: ActionStatus;
  priority?: ActionPriority;
  due_date?: string | null;
  assignee_id?: string | null;
  source_meeting_id?: number | null;
};

// A full replace: every editable field is sent, including the unchanged ones.
export type UpdateActionPayload = {
  id: number;
  name: string;
  summary?: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  due_date?: string | null;
  assignee_id?: string | null;
};

export type ActionBucket = {
  total: number;
  list: ActionData[];
};

export type ActionSummaryData = {
  today: string;
  my_tasks_today: number;
  team_overdue: number;
  active_tasks: number;
  approvals: ActionBucket;
  overdue_tasks: ActionBucket;
  due_today_tasks: ActionBucket;
  recent: ActionData[];
};

async function token() {
  return getSessionToken();
}

export async function listActions(
  options: ListActionsOptions = {}
): Promise<ApiEnvelope<ApiList<ActionData>>> {
  return callApi("/api/v1/actions", {
    token: await token(),
    body: options,
  });
}

export async function getActionSummary(): Promise<ApiEnvelope<ActionSummaryData>> {
  return callApi("/api/v1/actions/summary", {
    token: await token(),
  });
}

export async function getActionDetails(id: number): Promise<ApiEnvelope<ActionData>> {
  return callApi("/api/v1/actions/details", {
    token: await token(),
    body: { id },
  });
}

export async function createAction(
  payload: CreateActionPayload
): Promise<ApiEnvelope<ActionData>> {
  return callApi("/api/v1/actions/create", {
    token: await token(),
    body: payload,
  });
}

export async function updateAction(
  payload: UpdateActionPayload
): Promise<ApiEnvelope<ActionData>> {
  return callApi("/api/v1/actions/update", {
    token: await token(),
    body: payload,
  });
}

// Cron-only: no user session, so it authenticates with the static client secret.
export async function notifyOverdueActions(): Promise<ApiEnvelope<{ notified: number }>> {
  return callApi("/api/v1/actions/notify-overdue", {
    token: clientSecret(),
  });
}
