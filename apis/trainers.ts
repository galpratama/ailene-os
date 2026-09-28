import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type TrainerLevel = "junior" | "senior";
export type TrainerStage = "candidate" | "qualified" | "not_qualified" | "eligible" | "not_eligible";
export type TrainerStatus = "active" | "inactive";
export type TrainerSource =
  | "ai_community"
  | "top_alumni"
  | "domain_practitioner"
  | "trainer_network"
  | "corporate_practitioner"
  | "internal_referral";
export type ScreeningStep =
  | "application_review"
  | "interview"
  | "teaching_demo"
  | "practical_test"
  | "reference_check";
export type ScreeningStatus = "pending" | "passed" | "failed" | "skipped";
export type CertificationStep =
  | "orientation"
  | "material_mastery"
  | "shadowing"
  | "co_training"
  | "solo_observed_delivery"
  | "certification_decision";
export type CertificationStatus = "not_started" | "in_progress" | "passed" | "failed";

export type TrainerSpecialization = { id: number; name: string };

export type TrainerListItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  source: TrainerSource | null;
  level: TrainerLevel;
  stage: TrainerStage;
  status: TrainerStatus;
  specializations: TrainerSpecialization[];
  screening_progress: { passed: number; total: number };
  certification_progress: { passed: number; total: number };
  created_at: string;
};

export type TrainerSummary = {
  candidates: number;
  qualified: number;
  eligible: number;
  senior: number;
};

export type TrainerDetails = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  source: TrainerSource | null;
  level: TrainerLevel;
  stage: TrainerStage;
  status: TrainerStatus;
  referred_by: string | null;
  referred_by_name: string | null;
  notes: string | null;
  ai_experience_years: number;
  specializations: TrainerSpecialization[];
  screening_steps: { step: ScreeningStep; status: ScreeningStatus }[];
  ai_hands_on_score: number;
  facilitation_score: number;
  domain_credibility_score: number;
  communication_score: number;
  reliability_score: number;
  total_score: number;
  scored_at: string | null;
  certification_steps: {
    step: CertificationStep;
    status: CertificationStatus;
    recommended_sessions: number;
  }[];
  created_at: string;
  updated_at: string;
};

export type ListTrainersOptions = {
  stage?: TrainerStage;
  status?: TrainerStatus;
  level?: TrainerLevel;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export type TrainerApplicationPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  source?: TrainerSource | null;
  specialization_ids?: number[];
  teaching_experience?: string | null;
  portfolio_url?: string | null;
  ai_use_case?: string | null;
  ai_experience_years: number;
  availability_notes?: string | null;
  notes?: string | null;
  website?: string;
};

export type CreateTrainerPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  source?: TrainerSource | null;
  specialization_ids?: number[];
  ai_experience_years: number;
  level?: TrainerLevel;
  status?: TrainerStatus;
  referred_by?: string | null;
  notes?: string | null;
};

// A full replace: every editable field is sent, including the unchanged ones.
export type UpdateTrainerPayload = {
  id: string;
  phone: string | null;
  source: TrainerSource | null;
  level: TrainerLevel;
  status: TrainerStatus;
  ai_experience_years: number;
  referred_by: string | null;
  notes: string | null;
  specialization_ids: number[];
};

export type ScreeningScorePayload = {
  trainer_id: string;
  ai_hands_on_score: number;
  facilitation_score: number;
  domain_credibility_score: number;
  communication_score: number;
  reliability_score: number;
};

async function post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  return callApi(`/api/v1/${path}`, { token: await getSessionToken(), body });
}

export async function listTrainers(
  options: ListTrainersOptions = {}
): Promise<ApiEnvelope<ApiList<TrainerListItem>>> {
  return post("trainers", options);
}

export async function getTrainerSummary() {
  return post<TrainerSummary>("trainers/summary");
}

export async function getTrainerDetails(id: string) {
  return post<TrainerDetails>("trainers/details", { id });
}

export async function createTrainer(payload: CreateTrainerPayload) {
  return post<TrainerDetails>("trainers/create", payload);
}

export async function updateTrainer(payload: UpdateTrainerPayload) {
  return post<TrainerDetails>("trainers/update", payload);
}

export async function updateScreeningStep(payload: {
  trainer_id: string;
  step: ScreeningStep;
  status: ScreeningStatus;
}) {
  return post<TrainerDetails>("trainers/update-screening-step", payload);
}

export async function updateScreeningScore(payload: ScreeningScorePayload) {
  return post<TrainerDetails>("trainers/update-screening-score", payload);
}

export async function updateCertificationStep(payload: {
  trainer_id: string;
  step: CertificationStep;
  status: CertificationStatus;
}) {
  return post<TrainerDetails>("trainers/update-certification-step", payload);
}

export async function listTrainerSpecializations(): Promise<
  ApiEnvelope<ApiList<TrainerSpecialization & { trainer_count: number }>>
> {
  return post("trainer-specializations");
}

export async function createTrainerSpecialization(name: string) {
  return post<TrainerSpecialization>("trainer-specializations/create", { name });
}

export async function deleteTrainerSpecialization(id: number) {
  return post<null>("trainer-specializations/delete", { id });
}

// Public: the biz application form has no session, so these go through the static client secret.
export async function listSpecializationOptions(): Promise<
  ApiEnvelope<ApiList<TrainerSpecialization>>
> {
  return callApi("/api/v1/trainer-specializations/options", { token: clientSecret() });
}

export async function applyAsTrainer(
  payload: TrainerApplicationPayload
): Promise<ApiEnvelope<{ id: string | null }>> {
  return callApi("/api/v1/trainers/apply", { token: clientSecret(), body: payload });
}
