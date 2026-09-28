import { pushMeetingToGoogleCalendar } from "@/lib/google-calendar";
import { STATUS_CREATED } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { pipelineDataScopeWhere } from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import {
  numberIsID,
  stringIsTimestampTz,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import z from "zod";

export const createB2B = {
  meeting: administratorProcedure
    .input(
      z.object({
        pipeline_id: numberIsID(),
        organizer_id: stringIsUUID().optional(),
        scheduled_at: stringIsTimestampTz(),
        location_or_link: stringNotBlank().nullable().optional(),
        notes: stringNotBlank().nullable().optional(),
      })
    )
    .mutation(async (opts) => {
      const pipeline = await opts.ctx.prisma.pipeline.findFirst({
        where: {
          id: opts.input.pipeline_id,
          ...pipelineDataScopeWhere(opts.ctx.user),
        },
        select: { id: true, company: { select: { name: true } } },
      });
      if (!pipeline) {
        throw readFailedNotFound("pipeline");
      }

      // OWN-scoped users can only organize meetings they create — override whatever organizer_id the caller sent.
      const organizerId =
        opts.ctx.user.data_scope === "OWN"
          ? opts.ctx.user.id
          : opts.input.organizer_id ?? opts.ctx.user.id;

      const created = await opts.ctx.prisma.b2BMeeting.create({
        data: {
          pipeline_id: opts.input.pipeline_id,
          organizer_id: organizerId,
          created_by_id: opts.ctx.user.id,
          scheduled_at: new Date(opts.input.scheduled_at),
          location_or_link: opts.input.location_or_link ?? null,
          notes: opts.input.notes ?? null,
        },
      });

      await pushMeetingToGoogleCalendar(opts.ctx.prisma, {
        ...created,
        pipeline_name: pipeline.company.name,
        company_name: pipeline.company.name,
      });

      return {
        code: STATUS_CREATED,
        message: "Meeting created",
        id: created.id,
      };
    }),
};
