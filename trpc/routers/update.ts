import { createTRPCRouter } from "@/trpc/init";
import { updateB2B } from "./b2b/update.b2b";
import { updateLms } from "./lms/update.lms";
import { updateTrainerPool } from "./trainer-pool/update.trainer-pool";
import { updateUserData } from "./userdata/update.userdata";

export const updateRouter = createTRPCRouter({
  userdata: {
    profile: updateUserData.profile,
    status: updateUserData.status,
    reassignOwnership: updateUserData.reassignOwnership,
  },
  b2b: {
    company: updateB2B.company,
    pipeline: updateB2B.pipeline,
    action: updateB2B.action,
    contact: updateB2B.contact,
    resolveOrganizationDuplicateReview: updateB2B.resolveOrganizationDuplicateReview,
  },
  trainerPool: {
    trainer: updateTrainerPool.trainer,
    screeningStep: updateTrainerPool.screeningStep,
    screeningScore: updateTrainerPool.screeningScore,
    certificationStep: updateTrainerPool.certificationStep,
  },
  lms: {
    project: updateLms.project,
    level: updateLms.level,
    chapter: updateLms.chapter,
    selectChapterTrainer: updateLms.selectChapterTrainer,
  },
});
