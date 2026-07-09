import {
  TrainerCertificationStepEnum,
  TrainerLevelEnum,
  TrainerScreeningStepEnum,
} from "@prisma/client";

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

export function levelFromScore(totalScore: number): TrainerLevelEnum {
  if (totalScore >= 90) return TrainerLevelEnum.LEAD;
  if (totalScore >= 85) return TrainerLevelEnum.SENIOR;
  if (totalScore >= 75) return TrainerLevelEnum.CERTIFIED;
  return TrainerLevelEnum.APPRENTICE;
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
