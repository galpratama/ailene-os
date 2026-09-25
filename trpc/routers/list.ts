import { createTRPCRouter } from "@/trpc/init";
import { listAnalytics } from "./analytics/list.analytics";
import { listB2B } from "./b2b/list.b2b";
import { listLms } from "./lms/list.lms";
import { listNotification } from "./notification/list.notification";
import { listTrainerPool } from "./trainer-pool/list.trainer-pool";

export const listRouter = createTRPCRouter({
  // B2B Sales Pipeline //

  b2b: {
    allActions: listB2B.allActions,
    meetings: listB2B.meetings,
    quotations: listB2B.quotations,
    quotationApprovalQueue: listB2B.quotationApprovalQueue,
    calendar: listB2B.calendar,
    homeSummary: listB2B.homeSummary,
    dashboardAnalytics: listB2B.dashboardAnalytics,
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

  // Analytics //

  analytics: {
    ga4Dashboard: listAnalytics.ga4Dashboard,
    bizDashboard: listAnalytics.bizDashboard,
    metaAdsDashboard: listAnalytics.metaAdsDashboard,
  },

  // Notifications //

  notification: {
    mine: listNotification.mine,
    unreadCount: listNotification.unreadCount,
  },
});
