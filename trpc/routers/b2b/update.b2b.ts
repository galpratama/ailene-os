import { pushMeetingToGoogleCalendar } from "@/lib/google-calendar";
import { STATUS_FORBIDDEN, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { meetingDataScopeWhere } from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { notifyUsers } from "@/trpc/utils/notification";
import {
  numberIsID,
  stringIsTimestampTz,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import { B2BMeetingStatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const updateB2B = {
  meeting: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        organizer_id: stringIsUUID().optional(),
        scheduled_at: stringIsTimestampTz().optional(),
        held_at: stringIsTimestampTz().nullable().optional(),
        status: z.enum(B2BMeetingStatusEnum).optional(),
        location_or_link: stringNotBlank().nullable().optional(),
        notes: stringNotBlank().nullable().optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        id,
        scheduled_at,
        held_at,
        organizer_id,
        status,
        ...rest
      } = opts.input;

      // OWN-scoped users can only organize meetings they run — can't hand a meeting off to someone else.
      if (
        organizer_id !== undefined &&
        opts.ctx.user.data_scope === "OWN" &&
        organizer_id !== opts.ctx.user.id
      ) {
        throw new TRPCError({
          code: STATUS_FORBIDDEN,
          message: "You can't reassign this meeting to another organizer.",
        });
      }

      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BMeeting.findFirst({
          where: { id, ...meetingDataScopeWhere(opts.ctx.user) },
          select: { scheduled_at: true, organizer_id: true, created_by_id: true },
        });
        if (!existing) {
          throw readFailedNotFound("meeting");
        }

        const updated = await tx.b2BMeeting.update({
          where: { id },
          data: {
            ...rest,
            ...(organizer_id !== undefined && { organizer_id }),
            ...(status !== undefined && { status }),
            ...(scheduled_at !== undefined && {
              scheduled_at: new Date(scheduled_at),
            }),
            ...(held_at !== undefined && {
              held_at: held_at ? new Date(held_at) : null,
            }),
            // Marking a meeting Held without an explicit held_at defaults it to now.
            ...(status === "HELD" &&
              held_at === undefined && { held_at: new Date() }),
          },
        });

        if (
          scheduled_at !== undefined &&
          updated.scheduled_at.getTime() !== existing.scheduled_at.getTime()
        ) {
          await notifyUsers(tx, {
            userIds: [updated.organizer_id, existing.created_by_id],
            actorId: opts.ctx.user.id,
            type: "MEETING_TIME_CHANGED",
            entityType: "B2B_MEETING",
            entityId: updated.id,
            message: `Meeting time changed to ${updated.scheduled_at.toISOString()}.`,
          });
        }

      });

      const updatedMeeting = await opts.ctx.prisma.b2BMeeting.findUnique({
        where: { id },
        include: { pipeline: { include: { company: { select: { name: true } } } } },
      });
      if (updatedMeeting) {
        await pushMeetingToGoogleCalendar(opts.ctx.prisma, {
          ...updatedMeeting,
          pipeline_name: updatedMeeting.pipeline.company.name,
          company_name: updatedMeeting.pipeline.company.name,
        });
      }

      return {
        code: STATUS_OK,
        message: "Meeting updated",
      };
    }),
};
