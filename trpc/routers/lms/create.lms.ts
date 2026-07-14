import { STATUS_CREATED } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import {
  numberIsID,
  numberIsNonNegInt,
  stringNotBlank,
} from "@/trpc/utils/validation";
import { StatusEnum } from "@prisma/client";
import z from "zod";

const optionalText = stringNotBlank().nullable().optional();

export const createLms = {
  project: administratorProcedure
    .input(
      z.object({
        name: stringNotBlank(),
        company_id: numberIsID().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.lmsProject.create({
        data: { name: input.name, company_id: input.company_id ?? null },
      });
      return { code: STATUS_CREATED, message: "Project created", id: created.id };
    }),

  level: administratorProcedure
    .input(
      z.object({
        level_number: numberIsID(),
        name: stringNotBlank(),
        icon: z.url().nullable().optional(),
        min_xp: numberIsNonNegInt().optional(),
        status: z.enum(StatusEnum).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.lmsLevel.create({
        data: {
          level_number: input.level_number,
          name: input.name,
          icon: input.icon ?? null,
          min_xp: input.min_xp,
          status: input.status,
        },
      });
      return { code: STATUS_CREATED, message: "Level created", id: created.id };
    }),

  chapter: administratorProcedure
    .input(
      z.object({
        level_id: numberIsID(),
        name: stringNotBlank(),
        description: optionalText,
        session_date: z.iso.date(),
        status: z.enum(StatusEnum).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.lmsChapter.create({
        data: {
          level_id: input.level_id,
          name: input.name,
          description: input.description ?? null,
          session_date: new Date(input.session_date),
          status: input.status,
        },
      });
      return { code: STATUS_CREATED, message: "Chapter created", id: created.id };
    }),
};
