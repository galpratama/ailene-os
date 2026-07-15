import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyUUID } from "@/trpc/utils/validation";
import { TrainerScreeningStatusEnum } from "@prisma/client";
import {
  SCREENING_STEP_KEY_TO_COLUMN,
  SCREENING_STEP_KEYS,
} from "./trainer-pool.shared";

export const readTrainerPool = {
  trainer: administratorProcedure
    .input(objectHasOnlyUUID())
    .query(async ({ ctx, input }) => {
      const trainer = await ctx.prisma.trainer.findFirst({
        where: { id: input.id, deleted_at: null },
        include: {
          user: { include: { phone_country: true } },
          referrer: { select: { id: true, full_name: true } },
          specializations: {
            include: { specialization: true },
          },
          screening: true,
          certification_steps: { orderBy: { id: "asc" } },
          availabilities: { orderBy: { period: "desc" } },
        },
      });
      if (!trainer) throw readFailedNotFound("trainer");

      const { screening, ...trainerRest } = trainer;
      return {
        code: STATUS_OK,
        message: "Success",
        trainer: {
          ...trainerRest,
          full_name: trainer.user.full_name,
          email: trainer.user.email,
          phone_number: trainer.user.phone_number,
          phone_country: trainer.user.phone_country,
          specializations: trainer.specializations.map((entry) => ({
            id: entry.specialization.id,
            name: entry.specialization.specialization_name,
          })),
          screening_steps: SCREENING_STEP_KEYS.map((key) => ({
            step: key,
            status: screening
              ? screening[SCREENING_STEP_KEY_TO_COLUMN[key]]
              : TrainerScreeningStatusEnum.PENDING,
          })),
          ai_hands_on_score: screening?.ai_hands_on_score ?? 0,
          facilitation_score: screening?.facilitation_score ?? 0,
          domain_credibility_score: screening?.domain_credibility_score ?? 0,
          communication_score: screening?.communication_score ?? 0,
          reliability_score: screening?.reliability_score ?? 0,
          total_score: screening?.total_score ?? 0,
        },
      };
    }),
};
