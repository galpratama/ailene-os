import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkUpdateResult } from "@/trpc/utils/errors";
import {
  numberIsNonNegInt,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  Prisma,
  TrainerAvailabilityStatusEnum,
  TrainerCertificationStatusEnum,
  TrainerCertificationStepEnum,
  TrainerLevelEnum,
  TrainerScreeningStatusEnum,
  TrainerSourceEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  certificationSessionsRequired,
  computeScreeningTotal,
  deriveTrainerStage,
  levelFromScore,
  SCREENING_STEP_KEY_TO_COLUMN,
  SCREENING_STEP_KEYS,
} from "./trainer-pool.shared";

const optionalText = stringNotBlank().nullable().optional();

// Recomputes the trainer's pipeline stage from their current screening
// steps, rubric score, and certification decision, and persists it. Call
// this after any mutation that could move the trainer along the pipeline.
async function recomputeAndPersistStage(
  tx: Prisma.TransactionClient,
  trainerId: string
) {
  const [screening, certificationDecision] = await Promise.all([
    tx.trainerScreening.findUnique({ where: { trainer_id: trainerId } }),
    tx.trainerCertificationStep.findUnique({
      where: {
        trainer_id_step: {
          trainer_id: trainerId,
          step: TrainerCertificationStepEnum.CERTIFICATION_DECISION,
        },
      },
    }),
  ]);
  const stage = deriveTrainerStage({
    screening,
    certificationDecisionStatus: certificationDecision?.status ?? null,
  });
  await tx.trainer.update({ where: { id: trainerId }, data: { stage } });
  return stage;
}

export const updateTrainerPool = {
  trainer: administratorProcedure
    .input(
      z.object({
        id: stringIsUUID(),
        source: z.enum(TrainerSourceEnum).nullable().optional(),
        level: z.enum(TrainerLevelEnum).optional(),
        status: z.enum(TrainerStatusEnum).optional(),
        ai_experience_years: numberIsNonNegInt().max(60).optional(),
        notes: optionalText,
        specialization_ids: z.array(numberIsPosInt()).max(12).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, specialization_ids, ...data } = input;
      await ctx.prisma.$transaction(async (tx) => {
        const updated = await tx.trainer.updateMany({
          where: { id, deleted_at: null },
          data,
        });
        await checkUpdateResult(updated.count, "trainer", "trainers");
        if (specialization_ids) {
          await tx.trainerSpecializationMap.deleteMany({
            where: { trainer_id: id },
          });
          await tx.trainerSpecializationMap.createMany({
            data: specialization_ids.map((specialization_id) => ({
              trainer_id: id,
              specialization_id,
            })),
          });
        }
      });
      return { code: STATUS_OK, message: "Trainer updated" };
    }),

  screeningStep: administratorProcedure
    .input(
      z.object({
        trainer_id: stringIsUUID(),
        step: z.enum(SCREENING_STEP_KEYS),
        status: z.enum(TrainerScreeningStatusEnum),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const column = SCREENING_STEP_KEY_TO_COLUMN[input.step];
      await ctx.prisma.$transaction(async (tx) => {
        await tx.trainerScreening.upsert({
          where: { trainer_id: input.trainer_id },
          create: {
            trainer_id: input.trainer_id,
            [column]: input.status,
          } as Prisma.TrainerScreeningUncheckedCreateInput,
          update: {
            [column]: input.status,
          } as Prisma.TrainerScreeningUncheckedUpdateInput,
        });
        await recomputeAndPersistStage(tx, input.trainer_id);
      });
      return { code: STATUS_OK, message: "Screening step updated" };
    }),

  screeningScore: administratorProcedure
    .input(
      z.object({
        trainer_id: stringIsUUID(),
        ai_hands_on_score: z.int().min(0).max(100),
        facilitation_score: z.int().min(0).max(100),
        domain_credibility_score: z.int().min(0).max(100),
        communication_score: z.int().min(0).max(100),
        reliability_score: z.int().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        trainer_id,
        ai_hands_on_score,
        facilitation_score,
        domain_credibility_score,
        communication_score,
        reliability_score,
      } = input;
      const total_score = computeScreeningTotal({
        ai_hands_on_score,
        facilitation_score,
        domain_credibility_score,
        communication_score,
        reliability_score,
      });
      const suggested_level = levelFromScore(total_score);

      await ctx.prisma.$transaction(async (tx) => {
        await tx.trainerScreening.upsert({
          where: { trainer_id },
          create: {
            trainer_id,
            ai_hands_on_score,
            facilitation_score,
            domain_credibility_score,
            communication_score,
            reliability_score,
            total_score,
            scored_by: ctx.user.id,
            scored_at: new Date(),
          },
          update: {
            ai_hands_on_score,
            facilitation_score,
            domain_credibility_score,
            communication_score,
            reliability_score,
            total_score,
            scored_by: ctx.user.id,
            scored_at: new Date(),
          },
        });
        await tx.trainer.update({
          where: { id: trainer_id },
          data: { level: suggested_level },
        });
        await recomputeAndPersistStage(tx, trainer_id);
      });
      return {
        code: STATUS_OK,
        message: "Screening score updated",
        total_score,
        suggested_level,
      };
    }),

  certificationStep: administratorProcedure
    .input(
      z.object({
        trainer_id: stringIsUUID(),
        step: z.enum(TrainerCertificationStepEnum),
        status: z.enum(TrainerCertificationStatusEnum),
        sessions_required: numberIsPosInt().max(20).optional(),
        sessions_completed: numberIsNonNegInt().max(20).optional(),
        notes: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isDecision =
        input.step === TrainerCertificationStepEnum.CERTIFICATION_DECISION;
      const completed =
        input.status === TrainerCertificationStatusEnum.PASSED ||
        input.status === TrainerCertificationStatusEnum.FAILED;

      await ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.trainerCertificationStep.findUnique({
          where: {
            trainer_id_step: {
              trainer_id: input.trainer_id,
              step: input.step,
            },
          },
        });
        const sessionsRequired =
          input.sessions_required ??
          existing?.sessions_required ??
          certificationSessionsRequired(input.step);
        const sessionsCompleted =
          input.sessions_completed ?? existing?.sessions_completed ?? 0;

        if (
          input.status === TrainerCertificationStatusEnum.PASSED &&
          (input.step === TrainerCertificationStepEnum.SHADOWING ||
            input.step === TrainerCertificationStepEnum.CO_TRAINING) &&
          sessionsCompleted < sessionsRequired
        ) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message:
              "Complete all required sessions before passing this step.",
          });
        }

        if (
          isDecision &&
          input.status === TrainerCertificationStatusEnum.PASSED
        ) {
          const passedSteps = await tx.trainerCertificationStep.count({
            where: {
              trainer_id: input.trainer_id,
              step: {
                not: TrainerCertificationStepEnum.CERTIFICATION_DECISION,
              },
              status: TrainerCertificationStatusEnum.PASSED,
            },
          });
          if (passedSteps !== 5) {
            throw new TRPCError({
              code: STATUS_BAD_REQUEST,
              message:
                "All pathway steps must pass before certification approval.",
            });
          }
        }

        await tx.trainerCertificationStep.upsert({
          where: {
            trainer_id_step: {
              trainer_id: input.trainer_id,
              step: input.step,
            },
          },
          create: {
            trainer_id: input.trainer_id,
            step: input.step,
            status: input.status,
            sessions_required: sessionsRequired,
            sessions_completed: sessionsCompleted,
            evaluator_id: ctx.user.id,
            notes: input.notes ?? null,
            completed_at: completed ? new Date() : null,
          },
          update: {
            status: input.status,
            sessions_required: sessionsRequired,
            sessions_completed: sessionsCompleted,
            evaluator_id: ctx.user.id,
            notes: input.notes,
            completed_at: completed ? new Date() : null,
          },
        });

        await recomputeAndPersistStage(tx, input.trainer_id);
      });
      return {
        code: STATUS_OK,
        message: isDecision ? "Certification decision updated" : "Step updated",
      };
    }),

  availability: administratorProcedure
    .input(
      z.object({
        trainer_id: stringIsUUID(),
        period: z.iso.date(),
        status: z.enum(TrainerAvailabilityStatusEnum),
        notes: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.period.endsWith("-01")) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Availability period must be the first day of a month.",
        });
      }
      const period = new Date(input.period);
      await ctx.prisma.trainerAvailability.upsert({
        where: {
          trainer_id_period: {
            trainer_id: input.trainer_id,
            period,
          },
        },
        create: {
          trainer_id: input.trainer_id,
          period,
          status: input.status,
          notes: input.notes ?? null,
        },
        update: {
          status: input.status,
          notes: input.notes,
        },
      });
      return { code: STATUS_OK, message: "Availability updated" };
    }),
};
