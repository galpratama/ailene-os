import { createTRPCRouter } from "@/trpc/init";
import { readB2B } from "./b2b/read.b2b";
import { readIntegrations } from "./integrations/read.integrations";
import { readLms } from "./lms/read.lms";
import { readTrainerPool } from "./trainer-pool/read.trainer-pool";
import { readUserData } from "./userdata/read.userdata";

export const readRouter = createTRPCRouter({
  userdata: {
    user: readUserData.user,
  },
  integrations: {
    googleCalendarConnection: readIntegrations.googleCalendarConnection,
  },
  b2b: {
    company: readB2B.company,
    pipeline: readB2B.pipeline,
    action: readB2B.action,
    meeting: readB2B.meeting,
    contact: readB2B.contact,
  },
  trainerPool: {
    trainer: readTrainerPool.trainer,
  },
  lms: {
    project: readLms.project,
  },
});
