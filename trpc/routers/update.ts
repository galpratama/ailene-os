import { createTRPCRouter } from "@/trpc/init";
import { updateB2B } from "./b2b/update.b2b";

export const updateRouter = createTRPCRouter({
  b2b: {
    company: updateB2B.company,
    pipeline: updateB2B.pipeline,
    action: updateB2B.action,
  },
});
