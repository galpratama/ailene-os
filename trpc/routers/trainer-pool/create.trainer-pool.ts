import {
  STATUS_BAD_REQUEST,
  STATUS_CREATED,
} from "@/lib/status_code";
import {
  administratorProcedure,
  baseProcedure,
} from "@/trpc/init";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  Prisma,
  TrainerAssignmentRoleEnum,
  TrainerLevelEnum,
  TrainerScreeningStatusEnum,
  TrainerSourceEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  buildApplicationNotes,
  certificationSessionsRequired,
  certificationSteps,
  screeningSteps,
} from "./trainer-pool.shared";

const optionalText = stringNotBlank().nullable().optional();
const candidateInput = z.object({
  full_name: stringNotBlank(),
  email: z.email(),
  phone_country_id: numberIsPosInt().nullable().optional(),
  phone_number: optionalText,
  source: z.enum(TrainerSourceEnum).nullable().optional(),
  specialization_ids: z.array(numberIsPosInt()).max(12).default([]),
  teaching_experience: optionalText,
  portfolio_url: z.url().nullable().optional(),
  ai_use_case: optionalText,
  availability_notes: optionalText,
  notes: optionalText,
  website: z.string().max(200).optional(),
});

function duplicateCandidateError() {
  return new TRPCError({
    code: STATUS_BAD_REQUEST,
    message:
      "Email ini sudah pernah didaftarkan. Tim Ailene akan menghubungi kamu lewat kontak yang sudah masuk.",
  });
}

async function createTrainer(
  prisma: Prisma.TransactionClient,
  input: z.infer<typeof candidateInput>,
  applicationReviewPassed: boolean
) {
  return prisma.trainer.create({
    data: {
      full_name: input.full_name,
      email: input.email.toLowerCase(),
      phone_country_id: input.phone_country_id ?? null,
      phone_number: input.phone_number ?? null,
      source: input.source ?? null,
      notes: buildApplicationNotes(input) || null,
      specializations: {
        create: input.specialization_ids.map((specialization_id) => ({
          specialization: { connect: { id: specialization_id } },
        })),
      },
      screening_steps: {
        create: screeningSteps.map((step, index) => ({
          step,
          status:
            applicationReviewPassed && index === 0
              ? TrainerScreeningStatusEnum.PASSED
              : TrainerScreeningStatusEnum.PENDING,
          completed_at:
            applicationReviewPassed && index === 0 ? new Date() : null,
        })),
      },
      certification_steps: {
        create: certificationSteps.map((step) => ({
          step,
          sessions_required: certificationSessionsRequired(step),
        })),
      },
    },
  });
}

export const createTrainerPool = {
  candidate: baseProcedure
    .input(candidateInput)
    .mutation(async ({ ctx, input }) => {
      if (input.website) {
        return {
          code: STATUS_CREATED,
          message: "Application received",
          id: null,
        };
      }

      try {
        const created = await ctx.prisma.$transaction((tx) =>
          createTrainer(tx, input, true)
        );
        return {
          code: STATUS_CREATED,
          message: "Application received",
          id: created.id,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw duplicateCandidateError();
        }
        throw error;
      }
    }),

  trainer: administratorProcedure
    .input(candidateInput.omit({ website: true }).extend({
      level: z.enum(TrainerLevelEnum).optional(),
      status: z.enum(TrainerStatusEnum).optional(),
      referred_by: stringIsUUID().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await ctx.prisma.$transaction(async (tx) => {
          const trainer = await createTrainer(tx, input, false);
          return tx.trainer.update({
            where: { id: trainer.id },
            data: {
              level: input.level,
              status: input.status,
              referred_by: input.referred_by ?? null,
            },
          });
        });
        return {
          code: STATUS_CREATED,
          message: "Trainer created",
          id: created.id,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw duplicateCandidateError();
        }
        throw error;
      }
    }),

  assignment: administratorProcedure
    .input(
      z.object({
        pipeline_id: numberIsID(),
        trainer_id: stringIsUUID(),
        role: z.enum(TrainerAssignmentRoleEnum).optional(),
        session_date: z.iso.date().nullable().optional(),
        participant_count: numberIsPosInt().max(500).nullable().optional(),
        notes: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const trainer = await ctx.prisma.trainer.findFirst({
        where: { id: input.trainer_id, deleted_at: null },
      });
      if (!trainer) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Trainer is not available.",
        });
      }
      if (
        trainer.level === TrainerLevelEnum.APPRENTICE &&
        (input.role === undefined ||
          input.role === TrainerAssignmentRoleEnum.LEAD ||
          input.role === TrainerAssignmentRoleEnum.SPECIALIST)
      ) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Apprentice trainers must be assigned as assistant or co-trainer.",
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

      const created = await ctx.prisma.$transaction(async (tx) => {
        const assignment = await tx.trainerAssignment.create({
          data: {
            pipeline_id: input.pipeline_id,
            trainer_id: input.trainer_id,
            role: input.role,
            session_date: input.session_date
              ? new Date(input.session_date)
              : null,
            participant_count: input.participant_count ?? null,
            notes: input.notes ?? null,
          },
        });
        const sessionDate = input.session_date
          ? new Date(input.session_date)
          : null;
        const now = new Date();
        if (
          sessionDate &&
          sessionDate.getUTCFullYear() === now.getUTCFullYear() &&
          sessionDate.getUTCMonth() === now.getUTCMonth()
        ) {
          await tx.trainer.update({
            where: { id: input.trainer_id },
            data: { status: TrainerStatusEnum.ACTIVE },
          });
        }
        return assignment;
      });

      return {
        code: STATUS_CREATED,
        message: "Trainer assigned",
        id: created.id,
      };
    }),

  evaluation: administratorProcedure
    .input(
      z.object({
        assignment_id: numberIsID().nullable().optional(),
        trainer_id: stringIsUUID(),
        participant_rating_avg: z.number().min(0).max(5).nullable().optional(),
        self_report_submitted: z.boolean().optional(),
        review_notes: optionalText,
        evaluation_date: z.iso.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.assignment_id) {
        const assignment = await ctx.prisma.trainerAssignment.findFirst({
          where: {
            id: input.assignment_id,
            trainer_id: input.trainer_id,
          },
        });
        if (!assignment) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Assignment does not belong to this trainer.",
          });
        }
      }

      const created = await ctx.prisma.$transaction(async (tx) => {
        const evaluation = await tx.trainerEvaluation.create({
          data: {
            assignment_id: input.assignment_id ?? null,
            trainer_id: input.trainer_id,
            participant_rating_avg: input.participant_rating_avg,
            self_report_submitted: input.self_report_submitted,
            reviewed_by: ctx.user.id,
            review_notes: input.review_notes ?? null,
            evaluation_date: input.evaluation_date
              ? new Date(input.evaluation_date)
              : null,
          },
        });

        const rating = await tx.trainerEvaluation.aggregate({
          where: {
            trainer_id: input.trainer_id,
            participant_rating_avg: { not: null },
          },
          _avg: { participant_rating_avg: true },
        });
        const average = Number(rating._avg.participant_rating_avg);
        if (average > 0 && average < 4) {
          await tx.trainer.update({
            where: { id: input.trainer_id },
            data: {
              status:
                average < 3.5
                  ? TrainerStatusEnum.INACTIVE
                  : TrainerStatusEnum.REMEDIAL,
            },
          });
        }
        return evaluation;
      });

      return {
        code: STATUS_CREATED,
        message: "Evaluation created",
        id: created.id,
      };
    }),

  specialization: administratorProcedure
    .input(z.object({ name: stringNotBlank() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await ctx.prisma.trainerSpecialization.create({
          data: { specialization_name: input.name },
        });
        return {
          code: STATUS_CREATED,
          message: "Specialization created",
          id: created.id,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "This specialization already exists.",
          });
        }
        throw error;
      }
    }),
};
