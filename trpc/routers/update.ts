import { createTRPCRouter } from "@/trpc/init";
import { updateB2BClass } from "./b2b-class/update.b2b-class";
import { updateB2B } from "./b2b/update.b2b";
import { updateTrainerPool } from "./trainer-pool/update.trainer-pool";

export const updateRouter = createTRPCRouter({
  b2b: {
    company: updateB2B.company,
    pipeline: updateB2B.pipeline,
    action: updateB2B.action,
  },
  trainerPool: {
    trainer: updateTrainerPool.trainer,
    screeningStep: updateTrainerPool.screeningStep,
    screeningScore: updateTrainerPool.screeningScore,
    certificationStep: updateTrainerPool.certificationStep,
    availability: updateTrainerPool.availability,
  },
  b2bClass: {
    class: updateB2BClass.class,
    session: updateB2BClass.session,
    sessionOpen: updateB2BClass.sessionOpen,
    sessionClose: updateB2BClass.sessionClose,
    applicationStatus: updateB2BClass.applicationStatus,
    selectApplication: updateB2BClass.selectApplication,
  },
});
