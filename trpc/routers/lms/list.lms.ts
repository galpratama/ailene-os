import { STATUS_OK } from "@/lib/status_code";
import { baseProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsPosInt } from "@/trpc/utils/validation";
import { Prisma, StatusEnum } from "@prisma/client";
import z from "zod";

export const listLms = {
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
                  attendee_pax: true,
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

      // Session number = 1-indexed position among all the project's chapters by session_date, across levels.
      const projectIds = [...new Set(list.map((entry) => entry.level.project.id))];
      const projectChapters = await ctx.prisma.lmsChapter.findMany({
        where: { level: { project_id: { in: projectIds } } },
        select: { id: true, level: { select: { project_id: true } } },
        orderBy: [{ session_date: "asc" }, { id: "asc" }],
      });
      const sessionNumberByChapterId = new Map<number, number>();
      const counterByProjectId = new Map<number, number>();
      for (const chapter of projectChapters) {
        const projectId = chapter.level.project_id;
        const next = (counterByProjectId.get(projectId) ?? 0) + 1;
        counterByProjectId.set(projectId, next);
        sessionNumberByChapterId.set(chapter.id, next);
      }

      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          session_date: entry.session_date,
          method: entry.method,
          location_url: entry.location_url,
          location_name: entry.location_name,
          level_name: entry.level.name,
          level_number: entry.level.level_number,
          project_id: entry.level.project.id,
          project_name: entry.level.project.name,
          attendee_pax: entry.level.project.attendee_pax,
          company_name: entry.level.project.company?.name ?? null,
          trainer_name: entry.trainer?.user.full_name ?? null,
          session_number: sessionNumberByChapterId.get(entry.id) ?? null,
        })),
        metapaging: paging.metapaging,
      };
    }),

};
