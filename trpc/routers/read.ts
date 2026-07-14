import { createTRPCRouter } from "@/trpc/init";
import { readB2B } from "./b2b/read.b2b";
import { readLms } from "./lms/read.lms";
import { readTrainerPool } from "./trainer-pool/read.trainer-pool";

export const readRouter = createTRPCRouter({
  b2b: {
    company: readB2B.company,
    pipeline: readB2B.pipeline,
    action: readB2B.action,
  },
  trainerPool: {
    trainer: readTrainerPool.trainer,
  },
  lms: {
    project: readLms.project,
  },
});
