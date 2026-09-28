import { createTRPCRouter } from "@/trpc/init";
import { createB2B } from "./b2b/create.b2b";
import { createIntegrations } from "./integrations/create.integrations";
import { createTrainerPool } from "./trainer-pool/create.trainer-pool";

export const createRouter = createTRPCRouter({
  integrations: {
    googleCalendarConnection: createIntegrations.googleCalendarConnection,
  },
  b2b: {
    meeting: createB2B.meeting,
  },
  trainerPool: {
    candidate: createTrainerPool.candidate,
    trainer: createTrainerPool.trainer,
    specialization: createTrainerPool.specialization,
  },
});
