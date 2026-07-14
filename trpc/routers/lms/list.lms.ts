import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsID, numberIsPosInt, stringNotBlank } from "@/trpc/utils/validation";
import { Prisma } from "@prisma/client";
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
          company: { select: { id: true, name: true } },
          _count: { select: { groups: true } },
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
          company_id: entry.company?.id ?? null,
          company_name: entry.company?.name ?? null,
          group_count: entry._count.groups,
          created_at: entry.created_at,
        })),
        metapaging: paging.metapaging,
      };
    }),

  levels: administratorProcedure
    .input(
      z.object({
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsLevel.aggregate({ _count: true })
      );
      const list = await ctx.prisma.lmsLevel.findMany({
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
          chapter_count: entry._count.chapters,
        })),
        metapaging: paging.metapaging,
      };
    }),

  chapters: administratorProcedure
    .input(
      z.object({
        level_id: numberIsID().optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.LmsChapterWhereInput = { level_id: input.level_id };
      const paging = calculatePage(
        input,
        await ctx.prisma.lmsChapter.aggregate({ where, _count: true })
      );
      const list = await ctx.prisma.lmsChapter.findMany({
        where,
        include: {
          level: { select: { id: true, name: true, level_number: true } },
          _count: { select: { quizzes: true, videos: true, materials: true } },
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
          quiz_count: entry._count.quizzes,
          video_count: entry._count.videos,
          material_count: entry._count.materials,
        })),
        metapaging: paging.metapaging,
      };
    }),
};
