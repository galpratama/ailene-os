import { STATUS_OK } from "@/lib/status_code";
import {
  administratorProcedure,
  baseProcedure,
} from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  Prisma,
  TrainerLevelEnum,
  TrainerStageEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import z from "zod";

export const listTrainerPool = {
  applicationOptions: baseProcedure.query(async ({ ctx }) => {
    const [specializations, phoneCountries] = await Promise.all([
      ctx.prisma.trainerSpecialization.findMany({
        orderBy: [{ specialization_name: "asc" }],
      }),
      ctx.prisma.phoneCountryCode.findMany({
        orderBy: [{ country_name: "asc" }],
      }),
    ]);
    return {
      code: STATUS_OK,
      message: "Success",
      specializations: specializations.map((entry) => ({
        id: entry.id,
        name: entry.specialization_name,
      })),
      phone_countries: phoneCountries.map((entry) => ({
        id: entry.id,
        name: entry.country_name,
        phone_code: entry.phone_code,
        emoji: entry.emoji,
      })),
    };
  }),

  trainers: administratorProcedure
    .input(
      z.object({
        stage: z.enum(TrainerStageEnum).optional(),
        status: z.enum(TrainerStatusEnum).optional(),
        level: z.enum(TrainerLevelEnum).optional(),
        keyword: stringNotBlank().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.TrainerWhereInput = {
        deleted_at: null,
        // Backend-only filter, not surfaced as a picker in the UI — defaults
        // to active so deactivated trainers stay out of the pool by default.
        status: input.status ?? TrainerStatusEnum.ACTIVE,
        stage: input.stage,
        level: input.level,
        ...(input.keyword && {
          OR: [
            {
              user: {
                full_name: {
                  contains: input.keyword,
                  mode: "insensitive",
                },
              },
            },
            {
              user: {
                email: {
                  contains: input.keyword,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
      };
      const [aggregate, stageGroups, seniorCount] = await Promise.all([
        ctx.prisma.trainer.aggregate({ where, _count: true }),
        ctx.prisma.trainer.groupBy({
          by: ["stage"],
          where: { deleted_at: null },
          _count: true,
        }),
        ctx.prisma.trainer.count({
          where: { deleted_at: null, level: TrainerLevelEnum.SENIOR },
        }),
      ]);
      const paging = calculatePage(input, aggregate);
      const trainers = await ctx.prisma.trainer.findMany({
        where,
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
              phone_number: true,
              avatar: true,
            },
          },
          specializations: {
            include: { specialization: true },
          },
          screening: {
            select: {
              application_review: true,
              interview: true,
              teaching_demo: true,
              practical_test: true,
              reference_check: true,
            },
          },
          certification_steps: { select: { status: true } },
        },
        orderBy: [{ created_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      const counts = Object.fromEntries(
        stageGroups.map((group) => [group.stage, group._count])
      );

      return {
        code: STATUS_OK,
        message: "Success",
        list: trainers.map((trainer) => {
          const screeningStatuses = trainer.screening
            ? [
                trainer.screening.application_review,
                trainer.screening.interview,
                trainer.screening.teaching_demo,
                trainer.screening.practical_test,
                trainer.screening.reference_check,
              ]
            : [];
          return {
            id: trainer.id,
            full_name: trainer.user.full_name,
            email: trainer.user.email,
            phone_number: trainer.user.phone_number,
            avatar: trainer.user.avatar,
            source: trainer.source,
            level: trainer.level,
            stage: trainer.stage,
            status: trainer.status,
            specializations: trainer.specializations.map((entry) => ({
              id: entry.specialization.id,
              name: entry.specialization.specialization_name,
            })),
            screening_progress: {
              passed: screeningStatuses.filter(
                (status) => status === "PASSED"
              ).length,
              total: 5,
            },
            certification_progress: {
              passed: trainer.certification_steps.filter(
                (entry) => entry.status === "PASSED"
              ).length,
              total: trainer.certification_steps.length,
            },
            created_at: trainer.created_at,
          };
        }),
        summary: {
          candidates: counts[TrainerStageEnum.CANDIDATE] ?? 0,
          qualified: counts[TrainerStageEnum.QUALIFIED] ?? 0,
          certified: counts[TrainerStageEnum.CERTIFIED] ?? 0,
          senior: seniorCount,
        },
        metapaging: paging.metapaging,
      };
    }),

  assignments: administratorProcedure
    .input(
      z.object({
        trainer_id: stringIsUUID().optional(),
        pipeline_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.TrainerAssignmentWhereInput = {
        trainer_id: input.trainer_id,
        pipeline_id: input.pipeline_id,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.trainerAssignment.aggregate({
          where,
          _count: true,
        })
      );
      const list = await ctx.prisma.trainerAssignment.findMany({
        where,
        include: {
          trainer: {
            select: {
              id: true,
              level: true,
              user: { select: { full_name: true } },
            },
          },
          pipeline: {
            select: {
              id: true,
              name: true,
              company: { select: { name: true } },
            },
          },
        },
        orderBy: [{ session_date: "desc" }, { created_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          trainer_id: entry.trainer.id,
          trainer_name: entry.trainer.user.full_name,
          trainer_level: entry.trainer.level,
          pipeline_id: entry.pipeline.id,
          pipeline_name: entry.pipeline.name,
          company_name: entry.pipeline.company.name,
          role: entry.role,
          session_date: entry.session_date,
          participant_count: entry.participant_count,
          notes: entry.notes,
        })),
        metapaging: paging.metapaging,
      };
    }),

  specializations: administratorProcedure.query(async ({ ctx }) => {
    const list = await ctx.prisma.trainerSpecialization.findMany({
      include: { _count: { select: { trainers: true } } },
      orderBy: [{ specialization_name: "asc" }],
    });
    return {
      code: STATUS_OK,
      message: "Success",
      list: list.map((entry) => ({
        id: entry.id,
        name: entry.specialization_name,
        trainer_count: entry._count.trainers,
      })),
    };
  }),
};
