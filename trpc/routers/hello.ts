import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const helloRouter = createTRPCRouter({
  getHello: baseProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(async (opts) => {
      const who = opts.input.name?.trim() || "world";
      const result = await opts.ctx.prisma.$queryRaw<
        { now: Date }[]
      >`SELECT NOW() AS now`;

      return {
        greeting: `Hello, ${who}!`,
        serverTime: result[0]?.now ?? null,
      };
    }),
});
