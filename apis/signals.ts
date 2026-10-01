import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

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

export type CreateSignalPayload = {
  type: SignalType;
  source?: SignalSource;
  source_url: string;
  source_query?: string | null;
  source_title?: string | null;
  source_snippet?: string | null;
  subject_name?: string | null;
  subject_job_title?: string | null;
  company_name?: string | null;
  intent_score?: number | null;
  indonesia_signal?: boolean;
  signal_reason?: string | null;
  published_at?: string | null;
};

// Update replaces every editable field, so callers send the full record.
export type UpdateSignalPayload = Omit<CreateSignalPayload, "source" | "indonesia_signal"> & {
  id: number;
  status: SignalStatus;
  source: SignalSource;
  indonesia_signal: boolean;
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

export async function createSignal(payload: CreateSignalPayload): Promise<ApiEnvelope<SignalData>> {
  return callApi("/api/v1/signals/create", {
    token: await getSessionToken(),
    body: payload,
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
