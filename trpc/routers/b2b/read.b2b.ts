import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { meetingDataScopeWhere } from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

export const readB2B = {
  meeting: loggedInProcedure
    .input(objectHasOnlyID())
    .query(async (opts) => {
      const theMeeting = await opts.ctx.prisma.b2BMeeting.findFirst({
        where: { id: opts.input.id, ...meetingDataScopeWhere(opts.ctx.user) },
        include: {
          pipeline: {
            select: { id: true, company: { select: { id: true, name: true } } },
          },
          organizer: { select: { id: true, full_name: true, avatar: true } },
          created_by: { select: { id: true, full_name: true } },
        },
      });
      if (!theMeeting) {
        throw readFailedNotFound("meeting");
      }
      return {
        code: STATUS_OK,
        message: "Success",
        meeting: {
          id: theMeeting.id,
          pipeline_id: theMeeting.pipeline.id,
          pipeline_name: theMeeting.pipeline.company.name,
          company_id: theMeeting.pipeline.company.id,
          company_name: theMeeting.pipeline.company.name,
          organizer_id: theMeeting.organizer.id,
          organizer_name: theMeeting.organizer.full_name,
          organizer_avatar: theMeeting.organizer.avatar,
          created_by_id: theMeeting.created_by.id,
          created_by_name: theMeeting.created_by.full_name,
          scheduled_at: theMeeting.scheduled_at,
          held_at: theMeeting.held_at,
          status: theMeeting.status,
          location_or_link: theMeeting.location_or_link,
          notes: theMeeting.notes,
          google_sync_status: theMeeting.google_sync_status,
          created_at: theMeeting.created_at,
          updated_at: theMeeting.updated_at,
        },
      };
    }),
};
