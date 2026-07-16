import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkUpdateResult, readFailedNotFound } from "@/trpc/utils/errors";
import {
  numberIsID,
  numberIsNonNegInt,
  numberIsPosInt,
  stringIsNanoId,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  LmsChapterMethodEnum,
  LmsChapterTrainerRequestStatusEnum,
  StatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

const optionalText = stringNotBlank().nullable().optional();

export const updateLms = {
  project: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        company_id: numberIsID().nullable().optional(),
        attendee_pax: numberIsPosInt().nullable().optional(),
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
        project_id: numberIsID().optional(),
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
        trainer_id: stringIsNanoId().nullable().optional(),
        method: z.enum(LmsChapterMethodEnum).optional(),
        location_url: stringNotBlank().optional(),
        location_name: stringNotBlank().optional(),
        duration_minutes: numberIsPosInt().optional(),
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

  // Admin picks one pending request as the chapter's trainer: marks it
  // SELECTED, auto-rejects the other pending requests for that chapter, and
  // fills LmsChapter.trainer_id.
  selectChapterTrainer: administratorProcedure
    .input(z.object({ request_id: numberIsID() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(async (tx) => {
        const request = await tx.lmsChapterTrainerRequest.findUnique({
          where: { id: input.request_id },
        });
        if (!request) throw readFailedNotFound("request");
        if (request.status !== LmsChapterTrainerRequestStatusEnum.PENDING) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "This request has already been reviewed.",
          });
        }

        await tx.lmsChapterTrainerRequest.update({
          where: { id: request.id },
          data: {
            status: LmsChapterTrainerRequestStatusEnum.SELECTED,
            reviewed_by: ctx.user.id,
            reviewed_at: new Date(),
          },
        });
        await tx.lmsChapterTrainerRequest.updateMany({
          where: {
            chapter_id: request.chapter_id,
            id: { not: request.id },
            status: LmsChapterTrainerRequestStatusEnum.PENDING,
          },
          data: {
            status: LmsChapterTrainerRequestStatusEnum.REJECTED,
            reviewed_by: ctx.user.id,
            reviewed_at: new Date(),
          },
        });
        await tx.lmsChapter.update({
          where: { id: request.chapter_id },
          data: { trainer_id: request.trainer_id },
        });
      });
      return { code: STATUS_OK, message: "Trainer selected" };
    }),
};
