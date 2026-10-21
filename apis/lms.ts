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
  // Applied only when the person has no password yet; never replaces an existing one.
  password?: string;
};

export type LmsInviteResult = {
  member: LmsMemberEntry;
  email_sent: boolean;
  password_set: boolean;
  access_url: string;
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
  projectId: string,
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
  payload: InviteLmsMemberPayload,
): Promise<ApiEnvelope<LmsInviteResult>> {
  return callLmsAdmin("users/invite", payload);
}

export async function updateLmsMember(
  payload: UpdateLmsMemberPayload,
): Promise<ApiEnvelope<LmsMemberEntry>> {
  return callLmsAdmin("users/update", payload);
}

export async function deleteLmsMember(payload: {
  project_id: string;
  access_id: string;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("users/delete", payload);
}

export type LmsContentKind =
  | "pre_test"
  | "post_test"
  | "quiz"
  | "material"
  | "video";
export type LmsContentStatus = "active" | "inactive";
export type LmsQuestion = {
  id?: number;
  type: "multiple_choice" | "essay";
  question: string;
  explanation: string | null;
  xp_reward: number;
  options: { option_code: string; text: string; is_correct: boolean }[];
};
export type LmsVideoTimestamp = { start_seconds: number; title: string };
export type LmsContent = {
  id: string;
  kind: LmsContentKind;
  title: string;
  description: string | null;
  status: LmsContentStatus;
  content: string | null;
  file_url: string | null;
  image_url: string | null;
  video_url: string | null;
  xp_reward: number;
  questions: LmsQuestion[];
  timestamps: LmsVideoTimestamp[];
  has_progress: boolean;
};
export type LmsSchedule = {
  id: number;
  only_group_id: number | null;
  session_date: string;
  duration_minutes: number;
  location_name: string;
  location_url: string;
  method: "online" | "offline";
  trainer_id: string | null;
  status: LmsContentStatus;
  is_locked: boolean;
};
export type LmsChapter = {
  id: number;
  level_id: number;
  name: string;
  description: string | null;
  status: LmsContentStatus;
  sessions: LmsSchedule[];
  contents: LmsContent[];
};
export type LmsCurriculum = {
  levels: { id: number; name: string }[];
  chapters: LmsChapter[];
};
export type LmsChapterRef = { project_id: string; chapter_id: number };
export type LmsChapterPayload = {
  project_id: string;
  chapter_id?: number;
  level_id: number;
  name: string;
  description: string | null;
  status: LmsContentStatus;
};
export type LmsContentRef = LmsChapterRef & { kind: LmsContentKind };
export type LmsContentPayload = LmsContentRef &
  Omit<LmsContent, "id" | "has_progress">;
export type LmsSchedulePayload = LmsChapterRef &
  Omit<LmsSchedule, "id"> & { session_id?: number };
export type LmsScheduleRef = LmsChapterRef & { session_id: number };

export async function getLmsCurriculum(
  projectId: string,
): Promise<ApiEnvelope<LmsCurriculum>> {
  return callLmsAdmin("curriculum", { project_id: projectId });
}
export async function createLmsChapter(
  payload: LmsChapterPayload,
): Promise<ApiEnvelope<{ id: number }>> {
  return callLmsAdmin("curriculum/chapters/create", payload);
}
export async function updateLmsChapter(
  payload: LmsChapterPayload & { chapter_id: number },
): Promise<ApiEnvelope<{ id: number }>> {
  return callLmsAdmin("curriculum/chapters/update", payload);
}
export async function deleteLmsChapter(
  payload: LmsChapterRef,
): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("curriculum/chapters/delete", payload);
}
export async function createLmsSchedule(
  payload: LmsSchedulePayload,
): Promise<ApiEnvelope<{ id: number }>> {
  return callLmsAdmin("curriculum/schedules/create", payload);
}
export async function updateLmsSchedule(
  payload: LmsSchedulePayload & { session_id: number },
): Promise<ApiEnvelope<{ id: number }>> {
  return callLmsAdmin("curriculum/schedules/update", payload);
}
export async function deleteLmsSchedule(
  payload: LmsScheduleRef,
): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("curriculum/schedules/delete", payload);
}
export async function createLmsContent(
  payload: LmsContentPayload,
): Promise<ApiEnvelope<{ saved: boolean }>> {
  return callLmsAdmin("curriculum/contents/create", payload);
}
export async function updateLmsContent(
  payload: LmsContentPayload,
): Promise<ApiEnvelope<{ saved: boolean }>> {
  return callLmsAdmin("curriculum/contents/update", payload);
}
export async function deleteLmsContent(
  payload: LmsContentRef,
): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsAdmin("curriculum/contents/delete", payload);
}
