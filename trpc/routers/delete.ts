import { createTRPCRouter } from "@/trpc/init";
import { deleteB2B } from "./b2b/delete.b2b";
import { deleteLms } from "./lms/delete.lms";
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
    specialization: deleteTrainerPool.specialization,
  },
  lms: {
    project: deleteLms.project,
    level: deleteLms.level,
    chapter: deleteLms.chapter,
  },
});
