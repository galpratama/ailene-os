import { createTRPCRouter } from "@/trpc/init";
import { createB2B } from "./b2b/create.b2b";
import { createIntegrations } from "./integrations/create.integrations";
import { createLms } from "./lms/create.lms";
import { createTrainerPool } from "./trainer-pool/create.trainer-pool";
import { createUserData } from "./userdata/create.userdata";

export const createRouter = createTRPCRouter({
  userdata: {
    user: createUserData.user,
    team: createUserData.team,
  },
  integrations: {
    googleCalendarConnection: createIntegrations.googleCalendarConnection,
  },
  b2b: {
    company: createB2B.company,
    pipeline: createB2B.pipeline,
    action: createB2B.action,
    meeting: createB2B.meeting,
    quotation: createB2B.quotation,
    contact: createB2B.contact,
    organizationDuplicateReview: createB2B.organizationDuplicateReview,
  },
  trainerPool: {
    candidate: createTrainerPool.candidate,
    trainer: createTrainerPool.trainer,
    specialization: createTrainerPool.specialization,
  },
  lms: {
    project: createLms.project,
    level: createLms.level,
    chapter: createLms.chapter,
    chapterTrainerRequest: createLms.chapterTrainerRequest,
  },
});
