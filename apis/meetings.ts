import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type MeetingStatus = "scheduled" | "held" | "cancelled" | "no_show";
export type GoogleCalendarSyncStatus = "not_synced" | "synced" | "sync_failed";

export type MeetingData = {
  id: number;
  pipeline_id: number;
  company_id: number;
  company_name: string;
  organizer_id: string;
  organizer_name: string;
  organizer_avatar: string | null;
  created_by_id: string;
  created_by_name: string;
  scheduled_at: string;
  held_at: string | null;
  status: MeetingStatus;
  location_or_link: string | null;
  notes: string | null;
  google_sync_status: GoogleCalendarSyncStatus;
  google_sync_error: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

// Both dates are inclusive YYYY-MM-DD days in Asia/Jakarta.
export type ListMeetingsOptions = {
  start_date: string;
  end_date: string;
  pipeline_id?: number;
  organizer_id?: string;
  status?: MeetingStatus;
  page?: number;
  page_size?: number;
};

export type CreateMeetingPayload = {
  pipeline_id: number;
  organizer_id?: string | null;
  scheduled_at: string;
  location_or_link?: string | null;
  notes?: string | null;
  add_google_meet?: boolean;
};

// A full replace: every editable field is sent, including the unchanged ones.
export type UpdateMeetingPayload = {
  id: number;
  organizer_id?: string | null;
  scheduled_at: string;
  status: MeetingStatus;
  held_at?: string | null;
  location_or_link?: string | null;
  notes?: string | null;
  add_google_meet?: boolean;
};

export type GoogleCalendarConnectionData = {
  connected: boolean;
  google_calendar_id: string | null;
  connected_at: string | null;
};

async function token() {
  return getSessionToken();
}

export async function listMeetings(
  options: ListMeetingsOptions
): Promise<ApiEnvelope<ApiList<MeetingData>>> {
  return callApi("/api/v1/meetings", { token: await token(), body: options });
}

export async function getMeetingDetails(id: number): Promise<ApiEnvelope<MeetingData>> {
  return callApi("/api/v1/meetings/details", { token: await token(), body: { id } });
}

export async function createMeeting(
  payload: CreateMeetingPayload
): Promise<ApiEnvelope<MeetingData>> {
  return callApi("/api/v1/meetings/create", { token: await token(), body: payload });
}

export async function updateMeeting(
  payload: UpdateMeetingPayload
): Promise<ApiEnvelope<MeetingData>> {
  return callApi("/api/v1/meetings/update", { token: await token(), body: payload });
}

export async function deleteMeeting(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/meetings/delete", { token: await token(), body: { id } });
}

export async function getGoogleCalendarConnection(): Promise<
  ApiEnvelope<GoogleCalendarConnectionData>
> {
  return callApi("/api/v1/google-calendar/connection", { token: await token() });
}

export async function connectGoogleCalendar(payload: {
  code: string;
  redirect_uri: string;
}): Promise<ApiEnvelope<GoogleCalendarConnectionData>> {
  return callApi("/api/v1/google-calendar/connect", { token: await token(), body: payload });
}

export async function disconnectGoogleCalendar(): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/google-calendar/disconnect", { token: await token() });
}
