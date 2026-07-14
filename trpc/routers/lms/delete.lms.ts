import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkDeleteResult } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";
import { TRPCError } from "@trpc/server";

export const deleteLms = {
  project: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const groupCount = await ctx.prisma.lmsGroup.count({
        where: { project_id: input.id },
      });
      if (groupCount > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Cannot delete a project that still has groups.",
        });
      }
      const deleted = await ctx.prisma.lmsProject.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(deleted.count, "projects", "lms.project");
      return { code: STATUS_OK, message: "Project deleted" };
    }),

  level: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const chapterCount = await ctx.prisma.lmsChapter.count({
        where: { level_id: input.id },
      });
      if (chapterCount > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Cannot delete a level that still has chapters.",
        });
      }
      const deleted = await ctx.prisma.lmsLevel.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(deleted.count, "levels", "lms.level");
      return { code: STATUS_OK, message: "Level deleted" };
    }),

  chapter: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const [quizCount, videoCount, materialCount] = await Promise.all([
        ctx.prisma.lmsQuiz.count({ where: { chapter_id: input.id } }),
        ctx.prisma.lmsVideo.count({ where: { chapter_id: input.id } }),
        ctx.prisma.lmsMaterial.count({ where: { chapter_id: input.id } }),
      ]);
      if (quizCount + videoCount + materialCount > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Cannot delete a chapter that still has quizzes, videos, or materials.",
        });
      }
      const deleted = await ctx.prisma.lmsChapter.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(deleted.count, "chapters", "lms.chapter");
      return { code: STATUS_OK, message: "Chapter deleted" };
    }),
};
