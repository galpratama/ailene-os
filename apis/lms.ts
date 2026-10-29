import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
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

export type LmsMemberTestResult = {
  test_id: number;
  submitted: boolean;
  submitted_at: string | null;
  score: number | null;
};
export type LmsSessionMetric = {
  session_id: number;
  chapter_id: number;
  chapter_name: string;
  session_date: string;
  pre_test: LmsMemberTestResult | null;
  post_test: LmsMemberTestResult | null;
};
export type LmsMemberMetricsEntry = LmsMemberEntry & {
  pre_assessment: {
    status: LmsPaStatus;
    submitted_at: string | null;
    scored_at: string | null;
  };
  sessions: LmsSessionMetric[];
};

export async function listLmsMemberMetrics(payload: {
  project_id: string;
  group_id?: number | null;
}): Promise<ApiEnvelope<LmsMemberMetricsEntry[]>> {
  return callLmsV2("users/metrics", payload);
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
  // Only pre/post tests carry a learner lock.
  is_locked?: boolean;
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
  is_survey_locked: boolean;
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
export type LmsChapterEntry = Omit<LmsChapter, "sessions" | "contents"> & {
  level_name: string;
  created_at: string;
  updated_at: string;
};
// feedback_average averages the session's chapter-survey ratings; null until a survey exists.
export type LmsChapterSession = LmsSchedule & {
  feedback_count: number;
  feedback_average: number | null;
};
export type LmsChapterSessionsEntry = LmsChapterEntry & {
  sessions: LmsChapterSession[];
};
export type LmsLevel = { id: number; level_number: number; name: string };
export async function listLmsLevels(): Promise<ApiEnvelope<LmsLevel[]>> {
  return callLmsV2("levels");
}
export async function listLmsChapterSessions(
  projectId: string,
): Promise<ApiEnvelope<LmsChapterSessionsEntry[]>> {
  return callLmsV2("chapters/sessions", { project_id: projectId });
}
export type LmsChapterRef = { project_id: string; chapter_id: number };
export async function getLmsChapter(
  payload: LmsChapterRef,
): Promise<ApiEnvelope<LmsChapterEntry>> {
  return callLmsV2("chapters/details", payload);
}
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
type LmsScheduleFields = Omit<LmsSchedule, "id">;
export type LmsSchedulePayload = LmsChapterRef & LmsScheduleFields;
export type LmsNewChapterPayload = Omit<
  LmsChapterPayload,
  "project_id" | "chapter_id"
>;
export type CreateLmsSchedulePayload = { project_id: string } &
  LmsScheduleFields &
  (
    | { chapter_id: number; new_chapter?: never }
    | { chapter_id?: never; new_chapter: LmsNewChapterPayload }
  );
export type LmsScheduleRef = LmsChapterRef & { session_id: number };

export async function updateLmsChapter(
  payload: LmsChapterPayload & { chapter_id: number },
): Promise<ApiEnvelope<{ id: number }>> {
  return callLmsV2("chapters/update", payload);
}
export async function deleteLmsChapter(
  payload: LmsChapterRef,
): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("chapters/delete", payload);
}
export async function createLmsSchedule(
  payload: CreateLmsSchedulePayload,
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
// Chapter content on the Go LMS v2 API: one video, one material, and one test per kind per chapter.
type LmsV2Video = {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  xp_reward: number;
  status: LmsContentStatus;
  timestamps: LmsVideoTimestamp[];
};
type LmsV2Material = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  image_url: string | null;
  xp_reward: number;
  status: LmsContentStatus;
};
type LmsV2TestQuestion = {
  type: "multiple_choice" | "essay";
  question: string;
  explanation: string | null;
  options: { option_code: string; text: string; is_correct: boolean }[];
};
type LmsV2Test = {
  id: number;
  kind: "pre_test" | "post_test";
  name: string;
  description: string | null;
  status: LmsContentStatus;
  is_locked: boolean;
  submission_count: number;
  questions: (LmsV2TestQuestion & { id: number })[];
};

const emptyContent = {
  content: null,
  file_url: null,
  image_url: null,
  video_url: null,
  xp_reward: 0,
  questions: [],
  timestamps: [],
  has_progress: false,
};

export async function listLmsChapterContents(
  chapterId: number,
): Promise<ApiEnvelope<LmsContent[]>> {
  const body = { chapter_id: chapterId };
  const [videos, materials, tests] = await Promise.all([
    callLmsV2<LmsV2Video[]>("videos", body),
    callLmsV2<LmsV2Material[]>("materials", body),
    callLmsV2<LmsV2Test[]>("chapter-tests", body),
  ]);
  const failed = [videos, materials, tests].find((result) => !result.success);
  if (failed) return { ...failed, data: undefined };
  const contents: LmsContent[] = [
    ...(tests.data ?? []).map((test) => ({
      ...emptyContent,
      id: String(test.id),
      kind: test.kind,
      title: test.name,
      description: test.description,
      status: test.status,
      is_locked: test.is_locked,
      has_progress: test.submission_count > 0,
      questions: test.questions.map((question) => ({ ...question, xp_reward: 0 })),
    })),
    ...(videos.data ?? []).map((video) => ({
      ...emptyContent,
      id: String(video.id),
      kind: "video" as const,
      title: video.title,
      description: video.description,
      status: video.status,
      video_url: video.video_url,
      xp_reward: video.xp_reward,
      timestamps: video.timestamps,
    })),
    ...(materials.data ?? []).map((material) => ({
      ...emptyContent,
      id: material.id,
      kind: "material" as const,
      title: material.title,
      description: material.description,
      status: material.status,
      content: material.content,
      file_url: material.file_url,
      image_url: material.image_url,
      xp_reward: material.xp_reward,
    })),
  ];
  return { ...videos, data: contents };
}

export type LmsContentTarget = { id: string; is_locked: boolean; has_progress: boolean };

export async function saveLmsChapterContent(
  payload: LmsContentPayload,
  existing: LmsContentTarget | null,
): Promise<ApiEnvelope<unknown>> {
  const { project_id, chapter_id, kind } = payload;
  const description = payload.description?.trim() || null;
  if (kind === "video" || kind === "material") {
    const common = {
      project_id,
      title: payload.title.trim(),
      description,
      xp_reward: payload.xp_reward,
      order_index: 0,
      status: payload.status,
      ...(kind === "video"
        ? { video_url: payload.video_url ?? "", timestamps: payload.timestamps }
        : {
            content: payload.content || null,
            file_url: payload.file_url?.trim() || null,
            image_url: payload.image_url?.trim() || null,
          }),
    };
    const resource = kind === "video" ? "videos" : "materials";
    if (!existing) return callLmsV2(`${resource}/create`, { ...common, chapter_id });
    const idField = kind === "video" ? { video_id: Number(existing.id) } : { material_id: existing.id };
    return callLmsV2(`${resource}/update`, { ...common, ...idField });
  }
  const test = {
    project_id,
    name: payload.title.trim(),
    description,
    status: payload.status,
    is_locked: payload.is_locked ?? existing?.is_locked ?? false,
  };
  const questions: LmsV2TestQuestion[] = payload.questions.map((question) => ({
    type: question.type,
    question: question.question,
    explanation: question.explanation?.trim() || null,
    options: question.type === "essay" ? [] : question.options,
  }));
  if (!existing) {
    return callLmsV2("chapter-tests/create", { ...test, chapter_id, kind, questions });
  }
  // Submitted tests keep their questions; the API rejects a replacement.
  return callLmsV2("chapter-tests/update", {
    ...test,
    test_id: Number(existing.id),
    ...(existing.has_progress ? {} : { questions }),
  });
}

export async function deleteLmsChapterContent(payload: {
  project_id: string;
  kind: LmsContentKind;
  id: string;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  const { project_id, kind, id } = payload;
  if (kind === "video") return callLmsV2("videos/delete", { project_id, video_id: Number(id) });
  if (kind === "material") return callLmsV2("materials/delete", { project_id, material_id: id });
  return callLmsV2("chapter-tests/delete", { project_id, test_id: Number(id) });
}

export type LmsTool = {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export type LmsChapterTaskStep = {
  step_number: number;
  instruction: string;
  image_url: string | null;
};

export type LmsChapterTask = {
  id: number;
  chapter: { id: number; name: string };
  tool: Pick<LmsTool, "id" | "name" | "image_url">;
  name: string;
  description: string | null;
  order_index: number;
  status: LmsContentStatus;
  step_count: number;
  created_at: string;
  updated_at: string;
};

export type LmsChapterTaskDetail = LmsChapterTask & {
  steps: LmsChapterTaskStep[];
};

export type LmsChapterTaskPayload = {
  project_id: string;
  tool_id: number;
  name: string;
  description: string | null;
  order_index: number;
  status: LmsContentStatus;
  steps: { instruction: string; image_url: string | null }[];
};

export async function listLmsTools(): Promise<ApiEnvelope<LmsTool[]>> {
  return callLmsV2("tools");
}

export async function listLmsChapterTasks(
  chapterId: number,
): Promise<ApiEnvelope<LmsChapterTask[]>> {
  return callLmsV2("chapter-tasks", { chapter_id: chapterId });
}

export async function getLmsChapterTask(
  taskId: number,
): Promise<ApiEnvelope<LmsChapterTaskDetail>> {
  return callLmsV2("chapter-tasks/details", { task_id: taskId });
}

export async function createLmsChapterTask(
  payload: LmsChapterTaskPayload & { chapter_id: number },
): Promise<ApiEnvelope<LmsChapterTaskDetail>> {
  return callLmsV2("chapter-tasks/create", payload);
}

export async function updateLmsChapterTask(
  payload: LmsChapterTaskPayload & { task_id: number },
): Promise<ApiEnvelope<LmsChapterTaskDetail>> {
  return callLmsV2("chapter-tasks/update", payload);
}

export async function deleteLmsChapterTask(payload: {
  project_id: string;
  task_id: number;
}): Promise<ApiEnvelope<{ deleted: boolean }>> {
  return callLmsV2("chapter-tasks/delete", payload);
}

export type LmsChapterTaskSubmission = {
  id: number;
  status: "on_review" | "approved" | "rejected";
  student: { access_id: string };
  task: { id: number; chapter: { id: number } };
};

export async function listAllLmsChapterTaskSubmissions(payload: {
  project_id: string;
  chapter_id: number;
}): Promise<ApiEnvelope<LmsChapterTaskSubmission[]>> {
  const submissions: LmsChapterTaskSubmission[] = [];
  let page = 1;

  while (true) {
    const result = await callLmsV2<ApiList<LmsChapterTaskSubmission>>(
      "chapter-task-submissions",
      { ...payload, page, page_size: 100 },
    );
    if (!result.success || !result.data) {
      return {
        success: result.success,
        code: result.code,
        status: result.status,
        message: result.message,
      };
    }
    submissions.push(...result.data.list);
    if (page >= result.data.metapaging.total_page) {
      return { ...result, data: submissions };
    }
    page += 1;
  }
}

export type LmsTestStats = {
  test_id: number | null;
  submitted: number;
  average_score: number | null;
};
export type LmsSurveyRatingKey =
  | "trainer_clarity"
  | "trainer_mastery"
  | "trainer_responsiveness"
  | "trainer_engagement"
  | "material_relevance"
  | "material_flow"
  | "material_depth"
  | "learning_value";
export type LmsSurveyResponse = Record<LmsSurveyRatingKey, number> & {
  access_id: string;
  full_name: string;
  avatar: string | null;
  session_id: number;
  average: number;
  favorite_material: string | null;
  missing_topics: string | null;
  disliked_material: string | null;
  improvement_suggestion: string | null;
  submitted_at: string;
};
export type LmsChapterAnalyticsMember = {
  access_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: LmsMemberRole;
  group_name: string;
  pre_test_submitted: boolean;
  pre_test_score: number | null;
  post_test_submitted: boolean;
  post_test_score: number | null;
  video_completed: boolean;
  material_completed: boolean;
  tasks_submitted: number;
  tasks_approved: number;
  survey_submitted: boolean;
  survey_average: number | null;
};
export type LmsChapterAnalytics = {
  chapter_id: number;
  member_count: number;
  pre_test: LmsTestStats;
  post_test: LmsTestStats;
  video: { exists: boolean; completed: number };
  material: { exists: boolean; completed: number };
  tasks: { total: number; submitted: number; approved: number };
  survey: {
    count: number;
    average: number | null;
    ratings: Record<LmsSurveyRatingKey, number | null>;
    responses: LmsSurveyResponse[];
  };
  members: LmsChapterAnalyticsMember[];
};

export async function getLmsChapterAnalytics(
  payload: LmsChapterRef,
): Promise<ApiEnvelope<LmsChapterAnalytics>> {
  return callLmsV2("chapters/analytics", payload);
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
