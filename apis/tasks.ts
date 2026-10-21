import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type TaskStatus = "to_do" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskData = {
  id: number;
  name: string;
  summary: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  source_meeting_id: number | null;
  created_at: string;
  updated_at: string;
};

export type ListTasksOptions = {
  keyword?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  // Both bounds are inclusive YYYY-MM-DD due dates.
  due_from?: string;
  due_to?: string;
  page?: number;
  page_size?: number;
};

// Omitting assignee_id lets the API pick: the caller for own/team scope, unassigned for global.
export type CreateTaskPayload = {
  name: string;
  summary?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
  source_meeting_id?: number | null;
};

// A full replace: every editable field is sent, including the unchanged ones.
export type UpdateTaskPayload = {
  id: number;
  name: string;
  summary?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  assignee_id?: string | null;
};

export type TaskBucket = {
  total: number;
  list: TaskData[];
};

export type TaskSummaryData = {
  today: string;
  my_tasks_today: number;
  approvals: TaskBucket;
  overdue_tasks: TaskBucket;
  due_today_tasks: TaskBucket;
};

export async function listTasks(
  options: ListTasksOptions = {}
): Promise<ApiEnvelope<ApiList<TaskData>>> {
  return callApi("/api/v2/tasks", {
    token: await getSessionToken(),
    body: options,
  });
}

export async function getTaskSummary(): Promise<ApiEnvelope<TaskSummaryData>> {
  return callApi("/api/v2/tasks/summary", {
    token: await getSessionToken(),
  });
}

export async function getTaskDetails(id: number): Promise<ApiEnvelope<TaskData>> {
  return callApi("/api/v2/tasks/details", {
    token: await getSessionToken(),
    body: { id },
  });
}

export async function createTask(
  payload: CreateTaskPayload
): Promise<ApiEnvelope<TaskData>> {
  return callApi("/api/v2/tasks/create", {
    token: await getSessionToken(),
    body: payload,
  });
}

export async function updateTask(
  payload: UpdateTaskPayload
): Promise<ApiEnvelope<TaskData>> {
  return callApi("/api/v2/tasks/update", {
    token: await getSessionToken(),
    body: payload,
  });
}

// Administrators may delete any visible task; members only the ones assigned to them.
export async function deleteTask(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v2/tasks/delete", {
    token: await getSessionToken(),
    body: { id },
  });
}
