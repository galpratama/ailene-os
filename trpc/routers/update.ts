import { createTRPCRouter } from "@/trpc/init";
import { updateB2B } from "./b2b/update.b2b";
import { updateLms } from "./lms/update.lms";
import { updateNotification } from "./notification/update.notification";
import { updateTrainerPool } from "./trainer-pool/update.trainer-pool";

export const updateRouter = createTRPCRouter({
  b2b: {
    action: updateB2B.action,
    meeting: updateB2B.meeting,
    quotation: updateB2B.quotation,
    submitQuotation: updateB2B.submitQuotation,
    decideQuotation: updateB2B.decideQuotation,
    updateQuotationOutcome: updateB2B.updateQuotationOutcome,
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
  notification: {
    markRead: updateNotification.markRead,
    markAllRead: updateNotification.markAllRead,
  },
});
