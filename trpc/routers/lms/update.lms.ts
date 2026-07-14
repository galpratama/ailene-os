import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkUpdateResult } from "@/trpc/utils/errors";
import {
  numberIsID,
  numberIsNonNegInt,
  stringNotBlank,
} from "@/trpc/utils/validation";
import { StatusEnum } from "@prisma/client";
import z from "zod";

const optionalText = stringNotBlank().nullable().optional();

export const updateLms = {
  project: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        company_id: numberIsID().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.prisma.lmsProject.updateMany({
        where: { id },
        data,
      });
      await checkUpdateResult(updated.count, "project", "projects");
      return { code: STATUS_OK, message: "Project updated" };
    }),

  level: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        level_number: numberIsID().optional(),
        name: stringNotBlank().optional(),
        icon: z.url().nullable().optional(),
        min_xp: numberIsNonNegInt().optional(),
        status: z.enum(StatusEnum).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.prisma.lmsLevel.updateMany({
        where: { id },
        data,
      });
      await checkUpdateResult(updated.count, "level", "levels");
      return { code: STATUS_OK, message: "Level updated" };
    }),

  chapter: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        level_id: numberIsID().optional(),
        name: stringNotBlank().optional(),
        description: optionalText,
        session_date: z.iso.date().optional(),
        status: z.enum(StatusEnum).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, session_date, ...rest } = input;
      const updated = await ctx.prisma.lmsChapter.updateMany({
        where: { id },
        data: {
          ...rest,
          session_date: session_date ? new Date(session_date) : undefined,
        },
      });
      await checkUpdateResult(updated.count, "chapter", "chapters");
      return { code: STATUS_OK, message: "Chapter updated" };
    }),
};
