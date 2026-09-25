import { createTRPCRouter } from "@/trpc/init";
import { readB2B } from "./b2b/read.b2b";
import { readIntegrations } from "./integrations/read.integrations";
import { readTrainerPool } from "./trainer-pool/read.trainer-pool";

export const readRouter = createTRPCRouter({
  integrations: {
    googleCalendarConnection: readIntegrations.googleCalendarConnection,
  },
  b2b: {
    action: readB2B.action,
    meeting: readB2B.meeting,
    quotation: readB2B.quotation,
  },
  trainerPool: {
    trainer: readTrainerPool.trainer,
  },
});
