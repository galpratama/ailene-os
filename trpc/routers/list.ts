import { createTRPCRouter } from "@/trpc/init";
import { listB2B } from "./b2b/list.b2b";
import { listLms } from "./lms/list.lms";
import { listTrainerPool } from "./trainer-pool/list.trainer-pool";

export const listRouter = createTRPCRouter({
  // B2B Sales Pipeline //

  b2b: {
    calendar: listB2B.calendar,
  },

  // Trainer Pool //

  trainerPool: {
    applicationOptions: listTrainerPool.applicationOptions,
    trainers: listTrainerPool.trainers,
    specializations: listTrainerPool.specializations,
  },

  // LMS //

  lms: {
    marketplaceChapters: listLms.marketplaceChapters,
  },
});
