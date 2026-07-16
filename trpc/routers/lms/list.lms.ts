import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, baseProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsID, numberIsPosInt, stringNotBlank } from "@/trpc/utils/validation";
import {
  LmsChapterTrainerRequestStatusEnum,
  Prisma,
  StatusEnum,
} from "@prisma/client";
import z from "zod";

export const listLms = {
  projects: administratorProcedure
    .input(
      z.object({
        keyword: stringNotBlank().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsProjectWhereInput = input.keyword
        ? { name: { contains: input.keyword, mode: "insensitive" } }
        : {};
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsProject.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.lmsProject.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, image_url: true } },
          _count: { select: { groups: true } },
        },
        orderBy: [{ created_at: "desc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      // Sessions = chapters, which sit under a project's levels (not a
      // direct project relation), so tally them per-project separately.
      const levelChapterCounts = await ctx.prisma.lmsLevel.findMany({
        where: { project_id: { in: list.map((entry) => entry.id) } },
        select: { project_id: true, _count: { select: { chapters: true } } },
      });
      const sessionCountByProject = new Map<number, number>();
      for (const level of levelChapterCounts) {
        sessionCountByProject.set(
          level.project_id,
          (sessionCountByProject.get(level.project_id) ?? 0) +
            level._count.chapters
        );
      }

      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          name: entry.name,
          company_id: entry.company?.id ?? null,
          company_name: entry.company?.name ?? null,
          company_image_url: entry.company?.image_url ?? null,
          group_count: entry._count.groups,
          session_count: sessionCountByProject.get(entry.id) ?? 0,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  levels: administratorProcedure
    .input(
      z.object({
        project_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsLevelWhereInput = { project_id: input.project_id };
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsLevel.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.lmsLevel.findMany({
        where,
        include: { _count: { select: { chapters: true } } },
        orderBy: [{ level_number: "asc" }],
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          level_number: entry.level_number,
          name: entry.name,
          icon: entry.icon,
          min_xp: entry.min_xp,
          status: entry.status,
          project_id: entry.project_id,
          chapter_count: entry._count.chapters,
        })),
        metapaging: paging.metapaging,
      };
    }),

  chapters: administratorProcedure
    .input(
      z.object({
        level_id: numberIsID().optional(),
        project_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsChapterWhereInput = {
        level_id: input.level_id,
        level: input.project_id ? { project_id: input.project_id } : undefined,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsChapter.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.lmsChapter.findMany({
        where,
        include: {
          level: { select: { id: true, name: true, level_number: true } },
          trainer: { select: { id: true, user: { select: { full_name: true } } } },
          _count: {
            select: {
              quizzes: true,
              videos: true,
              materials: true,
              trainer_requests: {
                where: { status: LmsChapterTrainerRequestStatusEnum.PENDING },
              },
            },
          },
        },
        orderBy: [{ level: { level_number: "asc" } }, { session_date: "asc" }],
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
          session_date: entry.session_date,
          status: entry.status,
          level_id: entry.level.id,
          level_name: entry.level.name,
          level_number: entry.level.level_number,
          trainer_id: entry.trainer?.id ?? null,
          trainer_name: entry.trainer?.user.full_name ?? null,
          pending_request_count: entry._count.trainer_requests,
          quiz_count: entry._count.quizzes,
          video_count: entry._count.videos,
          material_count: entry._count.materials,
        })),
        metapaging: paging.metapaging,
      };
    }),

  // Public listing for the Class Marketplace (biz.*) — open, active chapters
  // any applied-and-eligible trainer can browse and request.
  marketplaceChapters: baseProcedure
    .input(
      z.object({
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsChapterWhereInput = { status: StatusEnum.ACTIVE };
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsChapter.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.lmsChapter.findMany({
        where,
        include: {
          level: {
            select: {
              id: true,
              name: true,
              level_number: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  company: { select: { name: true } },
                },
              },
            },
          },
          trainer: { select: { id: true, user: { select: { full_name: true } } } },
        },
        orderBy: [{ session_date: "asc" }],
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
          session_date: entry.session_date,
          level_name: entry.level.name,
          level_number: entry.level.level_number,
          project_id: entry.level.project.id,
          project_name: entry.level.project.name,
          company_name: entry.level.project.company?.name ?? null,
          trainer_name: entry.trainer?.user.full_name ?? null,
        })),
        metapaging: paging.metapaging,
      };
    }),

  chapterTrainerRequests: administratorProcedure
    .input(
      z.object({
        chapter_id: numberIsID().optional(),
        status: z.enum(LmsChapterTrainerRequestStatusEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsChapterTrainerRequestWhereInput = {
        chapter_id: input.chapter_id,
        status: input.status,
      };
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsChapterTrainerRequest.aggregate({
          where,
          _count: true,
        })
      );
      const list = await ctx.prisma.lmsChapterTrainerRequest.findMany({
        where,
        include: {
          chapter: { select: { id: true, name: true } },
          trainer: {
            select: {
              id: true,
              level: true,
              stage: true,
              user: { select: { full_name: true, avatar: true } },
            },
          },
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
          chapter_id: entry.chapter.id,
          chapter_name: entry.chapter.name,
          trainer_id: entry.trainer.id,
          trainer_name: entry.trainer.user.full_name,
          trainer_avatar: entry.trainer.user.avatar,
          trainer_level: entry.trainer.level,
          trainer_stage: entry.trainer.stage,
          status: entry.status,
          reviewed_by: entry.reviewed_by,
          reviewed_at: entry.reviewed_at,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),
};
