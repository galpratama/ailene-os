import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { lmsBaseUrl } from "./lms";
import { getSessionToken } from "./session";

export type LmsWorkflowStatus = "submitted" | "reviewed";

export type LmsWorkflowLearner = {
  access_id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  job_title: string;
  group: { id: number; name: string };
};

export type LmsWorkflowSubmission = {
  id: number;
  title: string;
  problem: string;
  frequency: string;
  result: string;
  status: LmsWorkflowStatus;
  summary: {
    step_count: number;
    total_minutes: number;
    pain_count: number;
    feedback_count: number;
  };
  learner: LmsWorkflowLearner;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LmsWorkflowDetails = LmsWorkflowSubmission & {
  nodes: {
    id: string;
    position: number;
    title: string;
    source: string | null;
    tool: string | null;
    minutes: number | null;
    pain_point: boolean;
  }[];
  attachments: {
    node_id: string | null;
    url: string;
    name: string;
    mime_type: string;
    size_bytes: number;
  }[];
  feedback: {
    id: number;
    node_id: string | null;
    kind: "automate" | "improve" | "question";
    body: string;
    author: Pick<LmsWorkflowLearner, "access_id" | "full_name" | "avatar">;
    created_at: string;
  }[];
};

export type ListLmsWorkflowSubmissionsOptions = {
  project_id: string;
  status?: LmsWorkflowStatus;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export async function listLmsWorkflowSubmissions(
  options: ListLmsWorkflowSubmissionsOptions,
): Promise<ApiEnvelope<ApiList<LmsWorkflowSubmission>>> {
  return callApi("/api/v2/workflows/submissions", {
    baseUrl: lmsBaseUrl(),
    token: await getSessionToken(),
    body: options,
  });
}

export async function getLmsWorkflowDetails(payload: {
  project_id: string;
  workflow_id: number;
}): Promise<ApiEnvelope<LmsWorkflowDetails>> {
  return callApi("/api/v2/workflows/submissions/details", {
    baseUrl: lmsBaseUrl(),
    token: await getSessionToken(),
    body: payload,
  });
}
