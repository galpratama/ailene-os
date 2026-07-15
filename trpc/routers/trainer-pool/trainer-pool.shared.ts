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
