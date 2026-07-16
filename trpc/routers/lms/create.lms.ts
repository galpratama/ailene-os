import { STATUS_BAD_REQUEST, STATUS_CREATED } from "@/lib/status_code";
import { administratorProcedure, loggedInProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import {
  numberIsID,
  numberIsNonNegInt,
  numberIsPosInt,
  stringIsNanoId,
  stringNotBlank,
} from "@/trpc/utils/validation";
import { LmsChapterMethodEnum, Prisma, StatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { assertTrainerCanRequestChapter } from "../trainer-pool/trainer-pool.shared";

const optionalText = stringNotBlank().nullable().optional();

export const createLms = {
  project: administratorProcedure
    .input(
      z.object({
        name: stringNotBlank(),
        company_id: numberIsID().nullable().optional(),
        attendee_pax: numberIsPosInt().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.lmsProject.create({
        data: {
          name: input.name,
          company_id: input.company_id ?? null,
          attendee_pax: input.attendee_pax ?? null,
        },
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
        project_id: numberIsID(),
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
          project_id: input.project_id,
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
        trainer_id: stringIsNanoId().nullable().optional(),
        method: z.enum(LmsChapterMethodEnum).optional(),
        location_url: stringNotBlank(),
        location_name: stringNotBlank(),
        duration_minutes: numberIsPosInt(),
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
          trainer_id: input.trainer_id ?? null,
          method: input.method,
          location_url: input.location_url,
          location_name: input.location_name,
          duration_minutes: input.duration_minutes,
        },
      });
      return { code: STATUS_CREATED, message: "Chapter created", id: created.id };
    }),

  // A chapter has exactly one trainer. The applicant is always the
  // logged-in session's own trainer profile (ctx.user) — no email input,
  // no impersonating another trainer. An admin picks one applicant via
  // update.lms.selectChapterTrainer.
  chapterTrainerRequest: loggedInProcedure
    .input(z.object({ chapter_id: numberIsID() }))
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.prisma.lmsChapter.findUnique({
        where: { id: input.chapter_id },
      });
      if (!chapter) throw readFailedNotFound("chapter");
      if (chapter.trainer_id) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Kelas ini sudah memiliki trainer.",
        });
      }

      const trainer = await ctx.prisma.trainer.findFirst({
        where: { user_id: ctx.user.id, deleted_at: null },
      });
      if (!trainer) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Akun ini belum terdaftar sebagai trainer. Daftar dulu sebagai trainer di halaman Join Trainer.",
        });
      }
      assertTrainerCanRequestChapter(trainer);

      try {
        const created = await ctx.prisma.lmsChapterTrainerRequest.create({
          data: {
            chapter_id: input.chapter_id,
            trainer_id: trainer.id,
          },
        });
        return {
          code: STATUS_CREATED,
          message: "Request submitted",
          id: created.id,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Kamu sudah mengajukan diri untuk kelas ini sebelumnya.",
          });
        }
        throw error;
      }
    }),
};
