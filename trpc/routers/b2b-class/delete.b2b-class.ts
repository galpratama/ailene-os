import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkDeleteResult } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";
import { TRPCError } from "@trpc/server";

export const deleteB2BClass = {
  class: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const sessionCount = await ctx.prisma.b2BClassSession.count({
        where: { class_id: input.id },
      });
      if (sessionCount > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Cannot delete a class that still has sessions.",
        });
      }
      const deleted = await ctx.prisma.b2BClass.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(deleted.count, "classes", "b2bClass.class");
      return { code: STATUS_OK, message: "Class deleted" };
    }),

  session: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const applicationCount = await ctx.prisma.trainerApplication.count({
        where: { session_id: input.id },
      });
      if (applicationCount > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Cannot delete a session that already has applications.",
        });
      }
      const deleted = await ctx.prisma.b2BClassSession.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(deleted.count, "sessions", "b2bClass.session");
      return { code: STATUS_OK, message: "Session deleted" };
    }),

  application: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.prisma.trainerApplication.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(
        deleted.count,
        "applications",
        "b2bClass.application"
      );
      return { code: STATUS_OK, message: "Application deleted" };
    }),
};
