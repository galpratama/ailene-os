import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import { getSessionToken } from "./session";

export type LmsMemberRole = "champion" | "student" | "sponsor";

export type LmsProjectEntry = {
  id: string;
  name: string;
  company_name: string;
  group_count: number;
  member_count: number;
};

export type LmsGroupEntry = {
  id: number;
  name: string;
  member_count: number;
  created_at: string;
};

export type LmsMemberEntry = {
  access_id: string;
  role: LmsMemberRole;
  group: { id: number; name: string };
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar: string | null;
    job_title: string;
    last_active_at: string | null;
  };
  joined_at: string;
};

export type InviteLmsMemberPayload = {
  project_id: string;
  email: string;
  full_name?: string;
  job_title?: string;
  role: LmsMemberRole;
  group_id: number;
};

export type UpdateLmsMemberPayload = {
  project_id: string;
  access_id: string;
  role?: LmsMemberRole;
  group_id?: number;
  full_name?: string;
  job_title?: string;
};

function lmsBaseUrl() {
  const baseUrl = process.env.LMS_BASE_URL;
  if (!baseUrl) {
    throw new Error("LMS_BASE_URL is not configured");
  }
  return baseUrl;
}

// The LMS admin endpoints accept the identity service's session token as-is, so the OS cookie is forwarded untouched.
async function callLmsAdmin<T>(path: string, body?: unknown) {
  return callApi<T>(`/api/v1/admin/${path}`, {
    baseUrl: lmsBaseUrl(),
    token: await getSessionToken(),
    body,
  });
}

export async function listLmsProjects(): Promise<
  ApiEnvelope<LmsProjectEntry[]>
> {
  return callLmsAdmin("projects");
}

export async function listLmsGroups(
  projectId: string
): Promise<ApiEnvelope<LmsGroupEntry[]>> {
  return callLmsAdmin("groups", { project_id: projectId });
}

export async function createLmsGroup(payload: {
  project_id: string;
  name: string;
}): Promise<ApiEnvelope<LmsGroupEntry>> {
  return callLmsAdmin("groups/create", payload);
}

export async function updateLmsGroup(payload: {
  project_id: string;
  group_id: number;
  name: string;
}): Promise<ApiEnvelope<LmsGroupEntry>> {
  return callLmsAdmin("groups/update", payload);
}

export async function deleteLmsGroup(payload: {
  project_id: string;
  group_id: number;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("groups/delete", payload);
}

export async function listLmsMembers(payload: {
  project_id: string;
  group_id?: number | null;
}): Promise<ApiEnvelope<LmsMemberEntry[]>> {
  return callLmsAdmin("users", payload);
}

export async function inviteLmsMember(
  payload: InviteLmsMemberPayload
): Promise<ApiEnvelope<LmsMemberEntry>> {
  return callLmsAdmin("users/invite", payload);
}

export async function updateLmsMember(
  payload: UpdateLmsMemberPayload
): Promise<ApiEnvelope<LmsMemberEntry>> {
  return callLmsAdmin("users/update", payload);
}

export async function deleteLmsMember(payload: {
  project_id: string;
  access_id: string;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("users/delete", payload);
}
