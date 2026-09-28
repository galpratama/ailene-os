import { STATUS_NO_CONTENT } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkDeleteResult } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

export const deleteTrainerPool = {
  specialization: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.prisma.trainerSpecialization.deleteMany({
        where: { id: input.id, trainers: { none: {} } },
      });
      await checkDeleteResult(
        deleted.count,
        "trainer specializations",
        "trainerPool.specialization"
      );
      return { code: STATUS_NO_CONTENT, message: "Specialization deleted" };
    }),
};
