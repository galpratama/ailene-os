import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import { getSessionToken } from "./session";

export type LmsMemberRole = "champion" | "student" | "sponsor";

export type LmsProjectEntry = {
  id: string;
  name: string;
  attendee_pax: number | null;
  company_name: string | null;
  company_image_url: string | null;
  company_slug: string | null;
  group_count: number;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type CreateLmsProjectPayload = {
  name: string;
  attendee_pax?: number | null;
  company_name?: string | null;
  company_image_url?: string | null;
};

export type UpdateLmsProjectPayload = {
  project_id: string;
  name?: string;
  attendee_pax?: number | null;
  company_name?: string | null;
  company_image_url?: string | null;
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

// Modules already ported to the Go LMS API live under `/api/v2/<resource>` and take the same identity token.
async function callLmsV2<T>(path: string, body?: unknown) {
  return callApi<T>(`/api/v2/${path}`, {
    baseUrl: lmsBaseUrl(),
    token: await getSessionToken(),
    body,
  });
}

export async function listLmsProjects(): Promise<
  ApiEnvelope<LmsProjectEntry[]>
> {
  return callLmsV2("projects");
}

export async function getLmsProject(
  projectId: string,
): Promise<ApiEnvelope<LmsProjectEntry>> {
  return callLmsV2("projects/details", { project_id: projectId });
}

export async function createLmsProject(
  payload: CreateLmsProjectPayload,
): Promise<ApiEnvelope<LmsProjectEntry>> {
  return callLmsV2("projects/create", payload);
}

export async function updateLmsProject(
  payload: UpdateLmsProjectPayload,
): Promise<ApiEnvelope<LmsProjectEntry>> {
  return callLmsV2("projects/update", payload);
}

export async function deleteLmsProject(payload: {
  project_id: string;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("projects/delete", payload);
}

export async function listLmsGroups(
  projectId: string,
): Promise<ApiEnvelope<LmsGroupEntry[]>> {
  return callLmsV2("groups", { project_id: projectId });
}

export async function createLmsGroup(payload: {
  project_id: string;
  name: string;
}): Promise<ApiEnvelope<LmsGroupEntry>> {
  return callLmsV2("groups/create", payload);
}

export async function updateLmsGroup(payload: {
  project_id: string;
  group_id: number;
  name: string;
}): Promise<ApiEnvelope<LmsGroupEntry>> {
  return callLmsV2("groups/update", payload);
}

export async function deleteLmsGroup(payload: {
  project_id: string;
  group_id: number;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("groups/delete", payload);
}

export async function listLmsMembers(payload: {
  project_id: string;
  group_id?: number | null;
}): Promise<ApiEnvelope<LmsMemberEntry[]>> {
  return callLmsV2("users", payload);
}

export async function getLmsMember(payload: {
  project_id: string;
  access_id: string;
}): Promise<ApiEnvelope<LmsMemberEntry>> {
  return callLmsV2("users/details", payload);
}

export async function inviteLmsMember(
  payload: InviteLmsMemberPayload,
): Promise<ApiEnvelope<LmsInviteResult>> {
  return callLmsV2("users/create", payload);
}

export async function updateLmsMember(
  payload: UpdateLmsMemberPayload,
): Promise<ApiEnvelope<LmsMemberEntry>> {
  return callLmsV2("users/update", payload);
}

export async function deleteLmsMember(payload: {
  project_id: string;
  access_id: string;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("users/delete", payload);
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
export type LmsChapterSessionsEntry = Omit<LmsChapter, "contents"> & {
  level_name: string;
  created_at: string;
  updated_at: string;
};
export type LmsCurriculum = {
  levels: { id: number; name: string }[];
  chapters: LmsChapter[];
};
export async function listLmsChapterSessions(
  projectId: string,
): Promise<ApiEnvelope<LmsChapterSessionsEntry[]>> {
  return callLmsV2("chapters/sessions", { project_id: projectId });
}
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
): Promise<ApiEnvelope<LmsSchedule>> {
  return callLmsV2("chapters/sessions/create", payload);
}
export async function updateLmsSchedule(
  payload: LmsSchedulePayload & { session_id: number },
): Promise<ApiEnvelope<LmsSchedule>> {
  return callLmsV2("chapters/sessions/update", payload);
}
export async function deleteLmsSchedule(
  payload: LmsScheduleRef,
): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("chapters/sessions/delete", payload);
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

export type LmsInsightsFilter = { project_id: string; group_id: number | null };
export type LmsInsightLearner = {
  access_id: string;
  role: LmsMemberRole;
  full_name: string;
  email: string;
  avatar: string | null;
  group_id: number | null;
  group_name: string | null;
};
export type LmsInsightChapter = { id: number; name: string; level_id: number };
export type LmsPaBand = { band: number; name: string | null; level: number | null };
export type LmsPaCluster = { code: string; name: string; score: number | null };
export type LmsPaSummary = {
  total: number;
  submitted: number;
  scored: number;
  meets_target: number;
  average_score: number | null;
  flagged_security: number;
  flagged_overclaim: number;
  flagged_shadow_ai: number;
};
export type LmsPaStatus = "not_started" | "submitted" | "scored";
export type LmsPaMember = {
  access_id: string;
  full_name: string;
  avatar: string | null;
  group_id: number;
  group_name: string | null;
  status: LmsPaStatus;
  band: LmsPaBand | null;
  average_score: number | null;
  meets_target: boolean;
  submitted_at: string | null;
  clusters: LmsPaCluster[];
  flags: {
    knowledge_score: number | null;
    skills_score: number | null;
    behaviours_score: number | null;
    security_gate_passed: boolean | null;
    behaviour_gate_passed: boolean | null;
    is_overclaim: boolean | null;
    is_shadow_ai: boolean | null;
  } | null;
};
export type LmsPreAssessmentInsights = {
  summary: LmsPaSummary;
  target_band: LmsPaBand;
  bands: (LmsPaBand & { count: number })[];
  clusters: LmsPaCluster[];
  groups: {
    group_id: number;
    group_name: string | null;
    total: number;
    scored: number;
    meets_target: number;
    average_score: number | null;
  }[];
  members: LmsPaMember[];
};

export type LmsGuidedStatus =
  | "intake"
  | "steps_ready"
  | "in_progress"
  | "ready_to_submit"
  | "submitted";
export type LmsGuidedReviewStatus =
  | "in_progress"
  | "awaiting_review"
  | "needs_revision"
  | "accepted";
export type LmsGuidedSummary = {
  total: number;
  in_progress: number;
  awaiting_review: number;
  needs_revision: number;
  accepted: number;
  minutes_saved_per_run: number | null;
  hours_saved: number | null;
  average_helpfulness: number | null;
};
export type LmsGuidedSession = {
  id: number;
  learner: LmsInsightLearner;
  status: LmsGuidedStatus;
  current_step: number;
  review_status: LmsGuidedReviewStatus;
  use_case_name: string | null;
  daily_task: string | null;
  frequency: string | null;
  pain_point: string | null;
  summary: string | null;
  minutes_without_ai: number | null;
  estimated_minutes_with_ai: number | null;
  step_count: number;
  steps_done: number;
  hours_saved: number | null;
  helpfulness_rating: number | null;
  testimonial: string | null;
  review_comment: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};
export type LmsGuidedInsights = {
  summary: LmsGuidedSummary;
  funnel: { status: LmsGuidedStatus; count: number }[];
  sessions: LmsGuidedSession[];
};

export type LmsSurveyRatings = {
  trainer_clarity: number | null;
  trainer_mastery: number | null;
  trainer_responsiveness: number | null;
  trainer_engagement: number | null;
  material_relevance: number | null;
  material_flow: number | null;
  material_depth: number | null;
  learning_value: number | null;
};
export type LmsReviewSummary = {
  learner_count: number;
  responses: number;
  trainer_average: number | null;
  material_average: number | null;
  learning_value_average: number | null;
  overall_average: number | null;
};
export type LmsReviewChapter = {
  chapter: LmsInsightChapter;
  responses: number;
  ratings: LmsSurveyRatings;
  trainer_average: number | null;
  material_average: number | null;
  overall_average: number | null;
};
export type LmsReviewResponse = {
  id: number;
  learner: LmsInsightLearner;
  chapter: LmsInsightChapter;
  ratings: LmsSurveyRatings;
  overall_average: number | null;
  missing_topics: string | null;
  favorite_material: string | null;
  disliked_material: string | null;
  improvement_suggestion: string | null;
  submitted_at: string;
};
export type LmsReviewInsights = {
  summary: LmsReviewSummary;
  chapters: LmsReviewChapter[];
  responses: LmsReviewResponse[];
};

export type LmsTestSummary = {
  pre_submissions: number;
  post_submissions: number;
  pre_average: number | null;
  post_average: number | null;
  average_uplift: number | null;
  improved_count: number;
  paired_count: number;
};
export type LmsTestChapter = {
  chapter: LmsInsightChapter;
  has_pre_test: boolean;
  has_post_test: boolean;
  pre_submissions: number;
  post_submissions: number;
  pre_average: number | null;
  post_average: number | null;
  average_uplift: number | null;
};
export type LmsTestResult = {
  learner: LmsInsightLearner;
  chapter: LmsInsightChapter;
  pre_submitted: boolean;
  pre_score: number | null;
  pre_submitted_at: string | null;
  post_submitted: boolean;
  post_score: number | null;
  post_submitted_at: string | null;
  uplift: number | null;
};
export type LmsTestInsights = {
  summary: LmsTestSummary;
  chapters: LmsTestChapter[];
  results: LmsTestResult[];
};

export type LmsQuizSummary = {
  submissions: number;
  participants: number;
  average_score: number | null;
  average_best_score: number | null;
  perfect_scores: number;
};
export type LmsQuizRow = {
  id: string;
  name: string;
  chapter: LmsInsightChapter;
  question_count: number;
  attempts: number;
  participants: number;
  average_score: number | null;
  average_best_score: number | null;
  highest_score: number | null;
};
export type LmsQuizSubmission = {
  id: number;
  learner: LmsInsightLearner;
  quiz_id: string;
  quiz_name: string;
  chapter: LmsInsightChapter;
  attempt_number: number;
  score: number;
  started_at: string;
  submitted_at: string;
};
export type LmsQuizInsights = {
  summary: LmsQuizSummary;
  distribution: { label: string; min: number; max: number; count: number }[];
  quizzes: LmsQuizRow[];
  submissions: LmsQuizSubmission[];
};

export type LmsInsightsOverview = {
  learner_count: number;
  pre_assessment: LmsPaSummary | null;
  guided_use_cases: LmsGuidedSummary;
  session_reviews: LmsReviewSummary;
  chapter_tests: LmsTestSummary;
  quizzes: LmsQuizSummary;
};

export async function getLmsInsightsOverview(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsInsightsOverview>> {
  return callLmsAdmin("insights/overview", filter);
}
export async function getLmsPreAssessmentInsights(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsPreAssessmentInsights>> {
  return callLmsAdmin("insights/pre-assessment", filter);
}
export async function getLmsGuidedInsights(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsGuidedInsights>> {
  return callLmsAdmin("insights/guided-use-cases", filter);
}
export async function getLmsReviewInsights(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsReviewInsights>> {
  return callLmsAdmin("insights/session-reviews", filter);
}
export async function getLmsTestInsights(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsTestInsights>> {
  return callLmsAdmin("insights/chapter-tests", filter);
}
export async function getLmsQuizInsights(
  filter: LmsInsightsFilter,
): Promise<ApiEnvelope<LmsQuizInsights>> {
  return callLmsAdmin("insights/quizzes", filter);
}
