import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, baseProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsID, numberIsPosInt } from "@/trpc/utils/validation";
import {
  B2BClassDifficultyEnum,
  B2BClassSessionStatusEnum,
  Prisma,
  TrainerApplicationStatusEnum,
} from "@prisma/client";
import z from "zod";
import { computeQuorum } from "./b2b-class.shared";

export const listB2BClass = {
  classes: administratorProcedure
    .input(
      z.object({
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const paging = calculatePage(
        input,
        await ctx.prisma.b2BClass.aggregate({ _count: true })
      );
      const list = await ctx.prisma.b2BClass.findMany({
        include: {
          pipeline: { select: { id: true, name: true } },
          _count: { select: { sessions: true } },
        },
        orderBy: [{ created_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          pipeline_id: entry.pipeline?.id ?? null,
          pipeline_name: entry.pipeline?.name ?? null,
          session_count: entry._count.sessions,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  sessions: administratorProcedure
    .input(
      z.object({
        class_id: numberIsID().optional(),
        status: z.enum(B2BClassSessionStatusEnum).optional(),
        difficulty: z.enum(B2BClassDifficultyEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.B2BClassSessionWhereInput = {
        class_id: input.class_id,
        status: input.status,
        difficulty: input.difficulty,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.b2BClassSession.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.b2BClassSession.findMany({
        where,
        include: {
          class: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ created_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          class_id: entry.class.id,
          class_name: entry.class.name,
          name: entry.name,
          difficulty: entry.difficulty,
          session_date: entry.session_date,
          status: entry.status,
          ...computeQuorum(entry, entry._count.applications),
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  applications: administratorProcedure
    .input(
      z.object({
        session_id: numberIsID(),
        status: z.enum(TrainerApplicationStatusEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.TrainerApplicationWhereInput = {
        session_id: input.session_id,
        status: input.status,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.trainerApplication.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.trainerApplication.findMany({
        where,
        include: {
          trainer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              level: true,
              level_override: true,
              status: true,
              ai_experience_years: true,
            },
          },
        },
        orderBy: [{ created_at: "asc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          status: entry.status,
          notes: entry.notes,
          reviewed_at: entry.reviewed_at,
          created_at: entry.created_at,
          trainer_id: entry.trainer.id,
          trainer_name: entry.trainer.full_name,
          trainer_email: entry.trainer.email,
          trainer_level: entry.trainer.level,
          trainer_level_override: entry.trainer.level_override,
          trainer_status: entry.trainer.status,
          trainer_ai_experience_years: entry.trainer.ai_experience_years,
        })),
        metapaging: paging.metapaging,
      };
    }),

  openSessions: baseProcedure
    .input(
      z.object({
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.B2BClassSessionWhereInput = {
        status: B2BClassSessionStatusEnum.OPEN,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.b2BClassSession.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.b2BClassSession.findMany({
        where,
        include: { class: { select: { id: true, name: true } } },
        orderBy: [{ opened_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          class_name: entry.class.name,
          name: entry.name,
          difficulty: entry.difficulty,
          session_date: entry.session_date,
        })),
        metapaging: paging.metapaging,
      };
    }),
};
