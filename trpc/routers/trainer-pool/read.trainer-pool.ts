import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyUUID } from "@/trpc/utils/validation";

export const readTrainerPool = {
  trainer: administratorProcedure
    .input(objectHasOnlyUUID())
    .query(async ({ ctx, input }) => {
      const trainer = await ctx.prisma.trainer.findFirst({
        where: { id: input.id, deleted_at: null },
        include: {
          phone_country: true,
          referrer: { select: { id: true, full_name: true } },
          specializations: {
            include: { specialization: true },
          },
          screening_steps: { orderBy: { id: "asc" } },
          screening_score: true,
          certification_steps: { orderBy: { id: "asc" } },
          availabilities: { orderBy: { period: "desc" } },
        },
      });
      if (!trainer) throw readFailedNotFound("trainer");

      return {
        code: STATUS_OK,
        message: "Success",
        trainer: {
          ...trainer,
          specializations: trainer.specializations.map((entry) => ({
            id: entry.specialization.id,
            name: entry.specialization.specialization_name,
          })),
        },
      };
    }),
};
