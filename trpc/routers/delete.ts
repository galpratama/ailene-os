import { createTRPCRouter } from "@/trpc/init";
import { deleteB2B } from "./b2b/delete.b2b";
import { deleteIntegrations } from "./integrations/delete.integrations";
import { deleteTrainerPool } from "./trainer-pool/delete.trainer-pool";

export const deleteRouter = createTRPCRouter({
  integrations: {
    googleCalendarConnection: deleteIntegrations.googleCalendarConnection,
  },
  b2b: {
    action: deleteB2B.action,
    meeting: deleteB2B.meeting,
    quotation: deleteB2B.quotation,
  },
  trainerPool: {
    trainer: deleteTrainerPool.trainer,
    specialization: deleteTrainerPool.specialization,
  },
});
