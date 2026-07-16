import { STATUS_OK } from "@/lib/status_code";
import {
  administratorProcedure,
  baseProcedure,
} from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsPosInt, stringNotBlank } from "@/trpc/utils/validation";
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
          certification: {
            select: {
              orientation: true,
              material_mastery: true,
              shadowing: true,
              co_training: true,
              solo_observed_delivery: true,
              certification_decision: true,
            },
          },
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
          const certificationStatuses = trainer.certification
            ? [
                trainer.certification.orientation,
                trainer.certification.material_mastery,
                trainer.certification.shadowing,
                trainer.certification.co_training,
                trainer.certification.solo_observed_delivery,
                trainer.certification.certification_decision,
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
              passed: certificationStatuses.filter(
                (status) => status === "PASSED"
              ).length,
              total: 6,
            },
            created_at: trainer.created_at,
          };
        }),
        summary: {
          candidates: counts[TrainerStageEnum.CANDIDATE] ?? 0,
          qualified: counts[TrainerStageEnum.QUALIFIED] ?? 0,
          eligible: counts[TrainerStageEnum.ELIGIBLE] ?? 0,
          senior: seniorCount,
        },
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
