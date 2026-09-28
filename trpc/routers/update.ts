import { createTRPCRouter } from "@/trpc/init";
import { updateB2B } from "./b2b/update.b2b";
import { updateTrainerPool } from "./trainer-pool/update.trainer-pool";

export const updateRouter = createTRPCRouter({
  b2b: {
    meeting: updateB2B.meeting,
  },
  trainerPool: {
    trainer: updateTrainerPool.trainer,
    screeningStep: updateTrainerPool.screeningStep,
    screeningScore: updateTrainerPool.screeningScore,
    certificationStep: updateTrainerPool.certificationStep,
  },
});
