import { createTRPCRouter } from "@/trpc/init";
import { createB2B } from "./b2b/create.b2b";
import { createTrainerPool } from "./trainer-pool/create.trainer-pool";

export const createRouter = createTRPCRouter({
  b2b: {
    company: createB2B.company,
    pipeline: createB2B.pipeline,
    action: createB2B.action,
  },
  trainerPool: {
    candidate: createTrainerPool.candidate,
    trainer: createTrainerPool.trainer,
    assignment: createTrainerPool.assignment,
    evaluation: createTrainerPool.evaluation,
    specialization: createTrainerPool.specialization,
  },
});
