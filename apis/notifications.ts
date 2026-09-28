import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type NotificationType =
  | "new_assignment"
  | "meeting_time_changed"
  | "overdue_next_action";
export type NotificationEntityType = "b2b_pipeline" | "b2b_action" | "b2b_meeting";

export type NotificationData = {
  id: number;
  type: NotificationType;
  entity_type: NotificationEntityType;
  entity_id: number;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type ListNotificationsOptions = {
  unread_only?: boolean;
  page?: number;
  page_size?: number;
};

async function token() {
  return getSessionToken();
}

export async function listNotifications(
  options: ListNotificationsOptions = {}
): Promise<ApiEnvelope<ApiList<NotificationData>>> {
  return callApi("/api/v1/notifications", {
    token: await token(),
    body: options,
  });
}

export async function getUnreadNotificationCount(): Promise<ApiEnvelope<{ count: number }>> {
  return callApi("/api/v1/notifications/unread-count", {
    token: await token(),
  });
}

export async function markNotificationRead(
  id: number
): Promise<ApiEnvelope<NotificationData>> {
  return callApi("/api/v1/notifications/mark-read", {
    token: await token(),
    body: { id },
  });
}

export async function markAllNotificationsRead(): Promise<ApiEnvelope<{ count: number }>> {
  return callApi("/api/v1/notifications/mark-all-read", {
    token: await token(),
  });
}
