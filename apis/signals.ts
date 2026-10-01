import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";
import { getSession, getSessionToken } from "./session";
import { STATUS_UNAUTHORIZED } from "@/lib/status_code";

export type SignalType = "hot_lead" | "warm_account" | "decision_maker";
export type SignalStatus = "new" | "reviewed" | "converted" | "discarded";
export type SignalSource = "linkedin" | "google" | "manual";

export type SignalData = {
  id: number;
  type: SignalType;
  status: SignalStatus;
  source: SignalSource;
  source_url: string;
  source_query: string | null;
  source_title: string | null;
  source_snippet: string | null;
  subject_name: string | null;
  subject_job_title: string | null;
  company_name: string | null;
  // Required for hot_lead, 0-10.
  intent_score: number | null;
  indonesia_signal: boolean;
  signal_reason: string | null;
  published_at: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ListSignalsOptions = {
  keyword?: string;
  type?: SignalType;
  status?: SignalStatus;
  source?: SignalSource;
  indonesia_signal?: boolean;
  min_intent_score?: number;
  page?: number;
  page_size?: number;
};

// Update replaces every editable field, so callers send the full record.
export type UpdateSignalPayload = {
  id: number;
  type: SignalType;
  status: SignalStatus;
  source: SignalSource;
  source_url: string;
  source_query?: string | null;
  source_title?: string | null;
  source_snippet?: string | null;
  subject_name?: string | null;
  subject_job_title?: string | null;
  company_name?: string | null;
  intent_score?: number | null;
  indonesia_signal: boolean;
  signal_reason?: string | null;
  published_at?: string | null;
};

type LinkedInTypeCounts = {
  results_found: number;
  created: number;
  skipped_duplicates: number;
  filtered_out: number;
};

export type LinkedInGenerationResult = {
  queries_run: number;
  serp_api_requests: number;
  results_found: number;
  created: number;
  skipped_duplicates: number;
  filtered_out: number;
  failed_queries: string[];
  hot_leads: LinkedInTypeCounts;
  warm_accounts: LinkedInTypeCounts;
  decision_makers: LinkedInTypeCounts;
};

export async function listSignals(
  options: ListSignalsOptions = {}
): Promise<ApiEnvelope<ApiList<SignalData>>> {
  return callApi("/api/v1/signals", {
    token: await getSessionToken(),
    body: options,
  });
}

export async function getSignalDetails(id: number): Promise<ApiEnvelope<SignalData>> {
  return callApi("/api/v1/signals/details", {
    token: await getSessionToken(),
    body: { id },
  });
}

export async function updateSignal(payload: UpdateSignalPayload): Promise<ApiEnvelope<SignalData>> {
  return callApi("/api/v1/signals/update", {
    token: await getSessionToken(),
    body: payload,
  });
}

export async function deleteSignal(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/signals/delete", {
    token: await getSessionToken(),
    body: { id },
  });
}

// Spends up to 56 SerpApi searches and authenticates with the static secret, so a live session is checked here first.
export async function generateLinkedInSignals(): Promise<ApiEnvelope<LinkedInGenerationResult>> {
  const { user } = await getSession();
  if (!user) {
    return { code: 401, status: STATUS_UNAUTHORIZED, message: "Session not found or already ended" };
  }

  return callApi("/api/v1/signals/generate/linkedin", { token: clientSecret() });
}
