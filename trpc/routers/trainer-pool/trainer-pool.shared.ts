import { STATUS_BAD_REQUEST } from "@/lib/status_code";
import {
  TrainerAssignmentRoleEnum,
  TrainerCertificationStepEnum,
  TrainerLevelEnum,
  TrainerScreeningStepEnum,
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

// Shared assignability rule used both by direct trainer-pool assignment and
// by selecting a trainer application into an assignment.
export function assertTrainerAssignable(
  trainer: { level: TrainerLevelEnum; status: TrainerStatusEnum },
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
  if (
    trainer.status !== TrainerStatusEnum.CERTIFIED &&
    trainer.status !== TrainerStatusEnum.ACTIVE
  ) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "Only certified or active trainers can be assigned.",
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
