import { STATUS_BAD_REQUEST, STATUS_CREATED } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { numberIsID } from "@/trpc/utils/validation";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { assertTrainerCanRequestChapter } from "../trainer-pool/trainer-pool.shared";

export const createLms = {
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
