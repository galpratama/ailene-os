import { createTRPCRouter } from "@/trpc/init";
import { createB2B } from "./b2b/create.b2b";

export const createRouter = createTRPCRouter({
  b2b: {
    company: createB2B.company,
    pipeline: createB2B.pipeline,
    action: createB2B.action,
  },
});
