import { createTRPCRouter } from "@/trpc/init";
import { deleteB2BClass } from "./b2b-class/delete.b2b-class";
import { deleteB2B } from "./b2b/delete.b2b";
import { deleteTrainerPool } from "./trainer-pool/delete.trainer-pool";

export const deleteRouter = createTRPCRouter({
  b2b: {
    company: deleteB2B.company,
    pipeline: deleteB2B.pipeline,
    action: deleteB2B.action,
  },
  trainerPool: {
    trainer: deleteTrainerPool.trainer,
    assignment: deleteTrainerPool.assignment,
    evaluation: deleteTrainerPool.evaluation,
    specialization: deleteTrainerPool.specialization,
  },
  b2bClass: {
    class: deleteB2BClass.class,
    session: deleteB2BClass.session,
    application: deleteB2BClass.application,
  },
});
