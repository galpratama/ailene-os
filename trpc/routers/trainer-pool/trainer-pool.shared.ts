import { STATUS_BAD_REQUEST } from "@/lib/status_code";
import {
  TrainerAssignmentRoleEnum,
  TrainerCertificationStatusEnum,
  TrainerLevelEnum,
  TrainerScreeningStatusEnum,
  TrainerStageEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Wire-level step identifiers the frontend sends/receives — these are no
// longer a Prisma enum (steps are now named columns on TrainerScreening),
// but the wire contract stays stable.
export const SCREENING_STEP_KEYS = [
  "APPLICATION_REVIEW",
  "INTERVIEW",
  "TEACHING_DEMO",
  "PRACTICAL_TEST",
  "REFERENCE_CHECK",
] as const;
export type ScreeningStepKey = (typeof SCREENING_STEP_KEYS)[number];

export const SCREENING_STEP_KEY_TO_COLUMN: Record<
  ScreeningStepKey,
  | "application_review"
  | "interview"
  | "teaching_demo"
  | "practical_test"
  | "reference_check"
> = {
  APPLICATION_REVIEW: "application_review",
  INTERVIEW: "interview",
  TEACHING_DEMO: "teaching_demo",
  PRACTICAL_TEST: "practical_test",
  REFERENCE_CHECK: "reference_check",
};

// Wire-level step identifiers the frontend sends/receives — no longer a
// Prisma enum (steps are now named columns on TrainerCertification), but the
// wire contract stays stable.
export const CERTIFICATION_STEP_KEYS = [
  "ORIENTATION",
  "MATERIAL_MASTERY",
  "SHADOWING",
  "CO_TRAINING",
  "SOLO_OBSERVED_DELIVERY",
  "CERTIFICATION_DECISION",
] as const;
export type CertificationStepKey = (typeof CERTIFICATION_STEP_KEYS)[number];

export const CERTIFICATION_STEP_KEY_TO_COLUMN: Record<
  CertificationStepKey,
  | "orientation"
  | "material_mastery"
  | "shadowing"
  | "co_training"
  | "solo_observed_delivery"
  | "certification_decision"
> = {
  ORIENTATION: "orientation",
  MATERIAL_MASTERY: "material_mastery",
  SHADOWING: "shadowing",
  CO_TRAINING: "co_training",
  SOLO_OBSERVED_DELIVERY: "solo_observed_delivery",
  CERTIFICATION_DECISION: "certification_decision",
};

// These three steps carry a recommended session count, shown as guidance to
// the evaluator (not tracked/gated per-trainer — the admin's own status call
// is authoritative).
export const CERTIFICATION_SESSION_STEPS: readonly CertificationStepKey[] = [
  "SHADOWING",
  "CO_TRAINING",
  "SOLO_OBSERVED_DELIVERY",
];

export function certificationSessionsRecommended(
  step: CertificationStepKey
): number {
  return CERTIFICATION_SESSION_STEPS.includes(step) ? 2 : 0;
}

// 75+ on the 100-point screening rubric clears the bar for Senior.
export function levelFromScore(totalScore: number): TrainerLevelEnum {
  return totalScore >= 75 ? TrainerLevelEnum.SENIOR : TrainerLevelEnum.JUNIOR;
}

// Each rubric criterion is scored 0-100 by the admin; these weights (summing
// to 1) are applied server-side to produce the overall 0-100 total. The
// frontend only displays the weight percentages — it never computes with
// them, so the scoring math lives in exactly one place.
export const SCREENING_RUBRIC_WEIGHTS = {
  ai_hands_on_score: 0.3,
  facilitation_score: 0.25,
  domain_credibility_score: 0.2,
  communication_score: 0.15,
  reliability_score: 0.1,
} as const;

export function computeScreeningTotal(scores: {
  ai_hands_on_score: number;
  facilitation_score: number;
  domain_credibility_score: number;
  communication_score: number;
  reliability_score: number;
}): number {
  const total =
    scores.ai_hands_on_score * SCREENING_RUBRIC_WEIGHTS.ai_hands_on_score +
    scores.facilitation_score * SCREENING_RUBRIC_WEIGHTS.facilitation_score +
    scores.domain_credibility_score *
      SCREENING_RUBRIC_WEIGHTS.domain_credibility_score +
    scores.communication_score * SCREENING_RUBRIC_WEIGHTS.communication_score +
    scores.reliability_score * SCREENING_RUBRIC_WEIGHTS.reliability_score;
  return Math.round(total);
}

// Minimum years of hands-on AI experience required to join the trainer pool.
export const MIN_AI_EXPERIENCE_YEARS = 1;

// A trainer needs at least this many of the 5 screening steps passed, and
// this rubric total, to qualify — same bar used for the Senior level.
const MIN_SCREENING_STEPS_PASSED = 4;
export const QUALIFYING_SCORE = 75;

// The trainer's pipeline stage is always derived from screening/certification
// progress, never set directly by an admin. Call this after any mutation to
// screening steps, the rubric score, or certification steps.
export function deriveTrainerStage(input: {
  screening: {
    application_review: TrainerScreeningStatusEnum;
    interview: TrainerScreeningStatusEnum;
    teaching_demo: TrainerScreeningStatusEnum;
    practical_test: TrainerScreeningStatusEnum;
    reference_check: TrainerScreeningStatusEnum;
    total_score: number;
  } | null;
  certificationDecisionStatus: TrainerCertificationStatusEnum | null | undefined;
}): TrainerStageEnum {
  if (input.certificationDecisionStatus === TrainerCertificationStatusEnum.PASSED) {
    return TrainerStageEnum.CERTIFIED;
  }
  if (input.certificationDecisionStatus === TrainerCertificationStatusEnum.FAILED) {
    return TrainerStageEnum.NOT_ELIGIBLE;
  }
  if (!input.screening) {
    return TrainerStageEnum.CANDIDATE;
  }

  const statuses = [
    input.screening.application_review,
    input.screening.interview,
    input.screening.teaching_demo,
    input.screening.practical_test,
    input.screening.reference_check,
  ];
  const allStepsDecided = statuses.every(
    (status) => status !== TrainerScreeningStatusEnum.PENDING
  );
  if (!allStepsDecided) {
    return TrainerStageEnum.CANDIDATE;
  }

  const passedCount = statuses.filter(
    (status) => status === TrainerScreeningStatusEnum.PASSED
  ).length;
  const qualified =
    passedCount >= MIN_SCREENING_STEPS_PASSED &&
    input.screening.total_score >= QUALIFYING_SCORE;

  return qualified ? TrainerStageEnum.QUALIFIED : TrainerStageEnum.NOT_QUALIFIED;
}

// Shared assignability rule used both by direct trainer-pool assignment and
// by selecting a trainer application into an assignment.
export function assertTrainerAssignable(
  trainer: {
    level: TrainerLevelEnum;
    stage: TrainerStageEnum;
    status: TrainerStatusEnum;
  },
  role: TrainerAssignmentRoleEnum | undefined
) {
  if (
    trainer.level === TrainerLevelEnum.JUNIOR &&
    (role === undefined ||
      role === TrainerAssignmentRoleEnum.LEAD ||
      role === TrainerAssignmentRoleEnum.SPECIALIST)
  ) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "Junior trainers must be assigned as assistant or co-trainer.",
    });
  }
  if (trainer.stage !== TrainerStageEnum.CERTIFIED) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "Only certified trainers can be assigned.",
    });
  }
  if (trainer.status !== TrainerStatusEnum.ACTIVE) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "This trainer is inactive.",
    });
  }
}

export function buildApplicationNotes(input: {
  teaching_experience?: string | null;
  portfolio_url?: string | null;
  ai_use_case?: string | null;
  availability_notes?: string | null;
  notes?: string | null;
}) {
  return [
    input.teaching_experience
      ? `Teaching experience\n${input.teaching_experience}`
      : null,
    input.portfolio_url ? `Portfolio\n${input.portfolio_url}` : null,
    input.ai_use_case ? `AI use case\n${input.ai_use_case}` : null,
    input.availability_notes
      ? `Availability\n${input.availability_notes}`
      : null,
    input.notes ? `Additional notes\n${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}
