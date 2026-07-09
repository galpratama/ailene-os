import { createTRPCRouter } from "@/trpc/init";
import { listAnalytics } from "./analytics/list.analytics";
import { listB2B } from "./b2b/list.b2b";
import { listLookup } from "./lookup/list.lookup";
import { listTrainerPool } from "./trainer-pool/list.trainer-pool";
import { listUserData } from "./userdata/list.userdata";

export const listRouter = createTRPCRouter({
  // Lookup Tables //

  roles: listLookup.roles,
  industries: listLookup.industries,

  // User Data //

  users: listUserData.users,

  // B2B Sales Pipeline //

  b2b: {
    companies: listB2B.companies,
    pipelines: listB2B.pipelines,
    actions: listB2B.actions,
    allActions: listB2B.allActions,
    calendar: listB2B.calendar,
    homeSummary: listB2B.homeSummary,
  },

  // Trainer Pool //

  trainerPool: {
    applicationOptions: listTrainerPool.applicationOptions,
    trainers: listTrainerPool.trainers,
    assignments: listTrainerPool.assignments,
    evaluations: listTrainerPool.evaluations,
    specializations: listTrainerPool.specializations,
  },

  // Analytics //

  analytics: {
    ga4Dashboard: listAnalytics.ga4Dashboard,
  },
});
