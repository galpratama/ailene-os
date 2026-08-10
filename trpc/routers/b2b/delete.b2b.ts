import { STATUS_BAD_REQUEST, STATUS_NO_CONTENT } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { pipelineDataScopeWhere } from "@/trpc/utils/data_scope";
import { checkDeleteResult, checkUpdateResult, readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";
import { TRPCError } from "@trpc/server";

export const deleteB2B = {
  // Never hard-deletes — always archives, so linked leads/history are preserved.
  company: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async (opts) => {
      const updated = await opts.ctx.prisma.b2BCompany.updateMany({
        where: { id: opts.input.id },
        data: { status: "ARCHIVED", archived_at: new Date() },
      });
      await checkUpdateResult(updated.count, "company", "companies");
      return {
        code: STATUS_NO_CONTENT,
        message: "Organization archived",
      };
    }),

  pipeline: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async (opts) => {
      const existing = await opts.ctx.prisma.b2BPipeline.findFirst({
        where: { id: opts.input.id, ...pipelineDataScopeWhere(opts.ctx.user) },
        select: { id: true, lms_projects: { select: { id: true }, take: 1 } },
      });
      if (!existing) {
        throw readFailedNotFound("pipeline");
      }
      if (existing.lms_projects.length > 0) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "This lead has a linked Corporate Training project and can't be deleted.",
        });
      }

      // Cascades at the DB level to this pipeline's actions (tasks) and stage history.
      const deleted = await opts.ctx.prisma.b2BPipeline.deleteMany({
        where: { id: opts.input.id },
      });
      await checkDeleteResult(deleted.count, "pipelines", "pipeline");
      return {
        code: STATUS_NO_CONTENT,
        message: "Success",
      };
    }),

  action: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async (opts) => {
      const deleted = await opts.ctx.prisma.b2BAction.deleteMany({
        where: { id: opts.input.id },
      });
      await checkDeleteResult(deleted.count, "actions", "action");
      return {
        code: STATUS_NO_CONTENT,
        message: "Success",
      };
    }),
};
