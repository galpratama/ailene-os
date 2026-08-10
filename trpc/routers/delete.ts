import { createTRPCRouter } from "@/trpc/init";
import { deleteB2B } from "./b2b/delete.b2b";
import { deleteLms } from "./lms/delete.lms";
import { deleteTrainerPool } from "./trainer-pool/delete.trainer-pool";
import { deleteUserData } from "./userdata/delete.userdata";

export const deleteRouter = createTRPCRouter({
  userdata: {
    team: deleteUserData.team,
  },
  b2b: {
    company: deleteB2B.company,
    pipeline: deleteB2B.pipeline,
    action: deleteB2B.action,
  },
  trainerPool: {
    trainer: deleteTrainerPool.trainer,
    specialization: deleteTrainerPool.specialization,
  },
  lms: {
    project: deleteLms.project,
    level: deleteLms.level,
    chapter: deleteLms.chapter,
    chapterTrainerRequest: deleteLms.chapterTrainerRequest,
  },
});
