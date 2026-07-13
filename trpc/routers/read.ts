import { createTRPCRouter } from "@/trpc/init";
import { readB2BClass } from "./b2b-class/read.b2b-class";
import { readB2B } from "./b2b/read.b2b";
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
  b2bClass: {
    class: readB2BClass.class,
    session: readB2BClass.session,
    sessionPublic: readB2BClass.sessionPublic,
  },
});
