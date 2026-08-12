import { deleteMeetingFromGoogleCalendar } from "@/lib/google-calendar";
import { STATUS_BAD_REQUEST, STATUS_NO_CONTENT } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import {
  meetingDataScopeWhere,
  pipelineDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
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

  // Cascades at the DB level to this meeting's attendees; linked next actions keep
  // existing (source_meeting_id set to NULL) rather than being deleted.
  meeting: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async (opts) => {
      const existing = await opts.ctx.prisma.b2BMeeting.findFirst({
        where: { id: opts.input.id, ...meetingDataScopeWhere(opts.ctx.user) },
        select: { organizer_id: true, google_event_id: true },
      });
      if (!existing) {
        throw readFailedNotFound("meeting");
      }

      await deleteMeetingFromGoogleCalendar(opts.ctx.prisma, existing);

      const deleted = await opts.ctx.prisma.b2BMeeting.deleteMany({
        where: { id: opts.input.id },
      });
      await checkDeleteResult(deleted.count, "meetings", "meeting");
      return {
        code: STATUS_NO_CONTENT,
        message: "Success",
      };
    }),

  // Only a never-submitted Draft can be hard-deleted; anything past that is append-only history.
  quotation: administratorProcedure
    .input(objectHasOnlyID())
    .mutation(async (opts) => {
      const existing = await opts.ctx.prisma.b2BQuotation.findFirst({
        where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
        select: { status: true },
      });
      if (!existing) {
        throw readFailedNotFound("quotation");
      }
      if (existing.status !== "DRAFT") {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Only a Draft quotation can be deleted.",
        });
      }

      const deleted = await opts.ctx.prisma.b2BQuotation.deleteMany({
        where: { id: opts.input.id },
      });
      await checkDeleteResult(deleted.count, "quotations", "quotation");
      return {
        code: STATUS_NO_CONTENT,
        message: "Success",
      };
    }),
};
