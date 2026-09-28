import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { numberIsID } from "@/trpc/utils/validation";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const listB2B = {
  // Meetings only — the calendar reads action due dates from the Actions API.
  calendar: loggedInProcedure
    .input(
      z.object({
        start_date: z.iso.date(),
        end_date: z.iso.date(),
        company_id: numberIsID().optional(),
        pipeline_id: numberIsID().optional(),
      })
    )
    .query(async (opts) => {
      const startDate = new Date(`${opts.input.start_date}T00:00:00.000Z`);
      const endDate = new Date(`${opts.input.end_date}T00:00:00.000Z`);

      if (endDate < startDate) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "end_date must be on or after start_date.",
        });
      }

      const meetingWhereClause: Prisma.B2BMeetingWhereInput = {
        scheduled_at: { gte: startDate, lte: endDate },
        pipeline_id: opts.input.pipeline_id,
        pipeline: opts.input.company_id
          ? { company_id: opts.input.company_id }
          : undefined,
      };

      const meetingList = await opts.ctx.prisma.b2BMeeting.findMany({
        include: {
          organizer: { select: { id: true, full_name: true, avatar: true } },
          pipeline: {
            select: {
              id: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ scheduled_at: "asc" }],
        where: meetingWhereClause,
      });

      const meetingEvents = meetingList.map((entry) => ({
        id: entry.id,
        type: "b2b_meeting" as const,
        title: `Meeting: ${entry.pipeline.company.name}`,
        pipeline_id: entry.pipeline_id,
        pipeline_name: entry.pipeline.company.name,
        company_id: entry.pipeline.company.id,
        company_name: entry.pipeline.company.name,
        // due_date is the calendar page's shared grouping field — holds scheduled_at for a meeting.
        due_date: entry.scheduled_at,
        status: entry.status,
        location_or_link: entry.location_or_link,
        organizer_id: entry.organizer_id,
        organizer_name: entry.organizer.full_name,
        organizer_avatar: entry.organizer.avatar,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      return {
        code: STATUS_OK,
        message: "Success",
        list: meetingEvents,
        meta: {
          start_date: opts.input.start_date,
          end_date: opts.input.end_date,
          total_data: meetingEvents.length,
        },
      };
    }),
};
