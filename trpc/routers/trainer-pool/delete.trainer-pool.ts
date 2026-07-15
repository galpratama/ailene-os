import { STATUS_NO_CONTENT } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkDeleteResult, checkUpdateResult } from "@/trpc/utils/errors";
import {
  objectHasOnlyID,
  objectHasOnlyUUID,
} from "@/trpc/utils/validation";
import { TrainerStatusEnum } from "@prisma/client";

export const deleteTrainerPool = {
  trainer: administratorProcedure
    .input(objectHasOnlyUUID())
    .mutation(async ({ ctx, input }) => {
      const archived = await ctx.prisma.trainer.updateMany({
        where: { id: input.id, deleted_at: null },
        data: {
          deleted_at: new Date(),
          status: TrainerStatusEnum.INACTIVE,
        },
      });
      await checkUpdateResult(archived.count, "trainer", "trainers");
      return { code: STATUS_NO_CONTENT, message: "Trainer archived" };
    }),

  assignment: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.prisma.trainerAssignment.deleteMany({
        where: { id: input.id },
      });
      await checkDeleteResult(
        deleted.count,
        "trainer assignments",
        "trainerPool.assignment"
      );
      return { code: STATUS_NO_CONTENT, message: "Assignment deleted" };
    }),

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
