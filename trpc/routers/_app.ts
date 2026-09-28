import { createTRPCRouter } from "@/trpc/init";
import { createRouter } from "./create";
import { deleteRouter } from "./delete";
import { listRouter } from "./list";
import { readRouter } from "./read";
import { updateRouter } from "./update";

export const appRouter = createTRPCRouter({
  list: listRouter,
  create: createRouter,
  read: readRouter,
  update: updateRouter,
  delete: deleteRouter,
});

export type AppRouter = typeof appRouter;
