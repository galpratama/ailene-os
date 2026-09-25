import { deleteMeetingFromGoogleCalendar } from "@/lib/google-calendar";
import { STATUS_BAD_REQUEST, STATUS_NO_CONTENT } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import {
  meetingDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { checkDeleteResult, readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";
import { TRPCError } from "@trpc/server";

export const deleteB2B = {
  // Cascades to this meeting's attendees; linked next actions survive with source_meeting_id set to NULL.
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
