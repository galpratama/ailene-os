import { STATUS_BAD_REQUEST } from "@/lib/status_code";
import {
  TrainerAssignmentRoleEnum,
  TrainerCertificationStatusEnum,
  TrainerCertificationStepEnum,
  TrainerLevelEnum,
  TrainerScreeningStatusEnum,
  TrainerScreeningStepEnum,
  TrainerStageEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const screeningSteps = [
  TrainerScreeningStepEnum.APPLICATION_REVIEW,
  TrainerScreeningStepEnum.INTERVIEW,
  TrainerScreeningStepEnum.TEACHING_DEMO,
  TrainerScreeningStepEnum.PRACTICAL_TEST,
  TrainerScreeningStepEnum.REFERENCE_CHECK,
];

export const certificationSteps = [
  TrainerCertificationStepEnum.ORIENTATION,
  TrainerCertificationStepEnum.MATERIAL_MASTERY,
  TrainerCertificationStepEnum.SHADOWING,
  TrainerCertificationStepEnum.CO_TRAINING,
  TrainerCertificationStepEnum.SOLO_OBSERVED_DELIVERY,
  TrainerCertificationStepEnum.CERTIFICATION_DECISION,
];

export function certificationSessionsRequired(
  step: TrainerCertificationStepEnum
) {
  return step === TrainerCertificationStepEnum.SHADOWING ||
    step === TrainerCertificationStepEnum.CO_TRAINING
    ? 2
    : 1;
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
  screeningSteps: { status: TrainerScreeningStatusEnum }[];
  screeningScoreTotal: number | null | undefined;
  certificationDecisionStatus: TrainerCertificationStatusEnum | null | undefined;
}): TrainerStageEnum {
  if (input.certificationDecisionStatus === TrainerCertificationStatusEnum.PASSED) {
    return TrainerStageEnum.CERTIFIED;
  }
  if (input.certificationDecisionStatus === TrainerCertificationStatusEnum.FAILED) {
    return TrainerStageEnum.NOT_ELIGIBLE;
  }

  const allStepsDecided =
    input.screeningSteps.length > 0 &&
    input.screeningSteps.every(
      (step) => step.status !== TrainerScreeningStatusEnum.PENDING
    );
  if (!allStepsDecided) {
    return TrainerStageEnum.CANDIDATE;
  }

  const passedCount = input.screeningSteps.filter(
    (step) => step.status === TrainerScreeningStatusEnum.PASSED
  ).length;
  const qualified =
    passedCount >= MIN_SCREENING_STEPS_PASSED &&
    (input.screeningScoreTotal ?? 0) >= QUALIFYING_SCORE;

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
