import { pushMeetingToGoogleCalendar } from "@/lib/google-calendar";
import { calculatePricing } from "@/lib/pricing-b2b";
import { STATUS_BAD_REQUEST, STATUS_FORBIDDEN, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import {
  actionDataScopeWhere,
  meetingDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { notifyUsers } from "@/trpc/utils/notification";
import {
  quotationInputShape,
  requirePackageType,
} from "@/trpc/routers/b2b/create.b2b";
import { computeRequiresReview, toPricingState } from "@/trpc/utils/quotation";
import {
  numberIsID,
  stringIsTimestampTz,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BMeetingStatusEnum,
  B2BQuotationApprovalDecisionEnum,
  B2BQuotationStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

// "YYYY-MM-DD" string from frontend. Day expected to be 01 by convention.
const monthDate = z.iso.date();

export const updateB2B = {
  action: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        summary: stringNotBlank().nullable().optional(),
        status: z.enum(B2BActionStatusEnum).optional(),
        priority: z.enum(B2BActionPriorityEnum).optional(),
        due_date: monthDate.nullable().optional(),
        assignee_id: stringIsUUID().nullable().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, due_date, ...rest } = opts.input;

      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BAction.findFirst({
          where: { id, ...actionDataScopeWhere(opts.ctx.user) },
          select: { assignee_id: true },
        });
        if (!existing) {
          throw readFailedNotFound("action");
        }

        const row = await tx.b2BAction.update({
          where: { id },
          data: {
            ...rest,
            ...(due_date !== undefined && {
              due_date: due_date ? new Date(due_date) : null,
            }),
          },
        });

        const assigneeChanged =
          rest.assignee_id !== undefined &&
          rest.assignee_id !== existing.assignee_id;
        if (assigneeChanged && row.assignee_id) {
          await notifyUsers(tx, {
            userIds: [row.assignee_id],
            actorId: opts.ctx.user.id,
            type: "NEW_ASSIGNMENT",
            entityType: "B2B_ACTION",
            entityId: row.id,
            message: `You were assigned to "${row.name}".`,
          });
        }
      });

      return {
        code: STATUS_OK,
        message: "Action updated",
      };
    }),

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

  // Full re-save of a Draft/Needs Revision quotation, same shape as create.b2b.quotation.
  quotation: administratorProcedure
    .input(requirePackageType(quotationInputShape.extend({ id: numberIsID() })))
    .mutation(async (opts) => {
      const { id, days, ...rest } = opts.input;

      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BQuotation.findFirst({
          where: { id, ...quotationDataScopeWhere(opts.ctx.user) },
          select: { status: true },
        });
        if (!existing) {
          throw readFailedNotFound("quotation");
        }
        if (existing.status !== "DRAFT" && existing.status !== "NEEDS_REVISION") {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Only a Draft or Needs Revision quotation can be edited.",
          });
        }

        const result = calculatePricing(toPricingState({ ...rest, days }));
        const requiresReview = computeRequiresReview(
          rest.source_type,
          result.margin
        );

        await tx.b2BQuotation.update({
          where: { id },
          data: {
            source_type: rest.source_type,
            package_type: rest.package_type ?? null,
            materi: rest.materi,
            bd_pct: rest.bd_pct,
            dc_pct: rest.dc_pct,
            addon_assessment: rest.addon_assessment,
            addon_klinik: rest.addon_klinik,
            addon_klinik_sesi: rest.addon_klinik_sesi,
            addon_rekaman: rest.addon_rekaman,
            addon_sertifikat: rest.addon_sertifikat,
            addon_sertifikat_qty: rest.addon_sertifikat_qty,
            addon_perjalanan: rest.addon_perjalanan,
            addon_perjalanan_rp: rest.addon_perjalanan_rp,
            subtotal: result.subtotal,
            discount: result.discount,
            net_value: result.netValue,
            invoice_amount: result.invoice,
            pph_tax: result.pphTax,
            trainer_cost: result.trainerCost,
            addons_cost: result.addonsCost,
            bd_fee: result.bdFee,
            ops_fee: result.opsFee,
            amo_fee: result.amoFee,
            total_cost: result.totalCost,
            net_profit: result.genesis,
            margin_pct: result.margin,
            requires_review: requiresReview,
          },
        });

        await tx.b2BQuotationLineItem.deleteMany({ where: { quotation_id: id } });
        await tx.b2BQuotationLineItem.createMany({
          data: days.map((day, index) => ({
            quotation_id: id,
            order_index: index,
            format: day.format,
            sesi: day.sesi,
            peserta: day.peserta,
            trainer: day.trainer,
          })),
        });
      });

      return {
        code: STATUS_OK,
        message: "Quotation updated",
      };
    }),

  // Draft/Needs Revision -> Manager Review, or straight to Approved if it doesn't need review.
  submitQuotation: administratorProcedure
    .input(z.object({ id: numberIsID() }))
    .mutation(async (opts) => {
      const existing = await opts.ctx.prisma.b2BQuotation.findFirst({
        where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
        select: { status: true, requires_review: true },
      });
      if (!existing) {
        throw readFailedNotFound("quotation");
      }
      if (existing.status !== "DRAFT" && existing.status !== "NEEDS_REVISION") {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Only a Draft or Needs Revision quotation can be submitted.",
        });
      }

      const nextStatus: B2BQuotationStatusEnum = existing.requires_review
        ? "MANAGER_REVIEW"
        : "APPROVED";
      await opts.ctx.prisma.b2BQuotation.update({
        where: { id: opts.input.id },
        data: { status: nextStatus },
      });

      return {
        code: STATUS_OK,
        message:
          nextStatus === "APPROVED"
            ? "Quotation auto-approved"
            : "Quotation sent for manager review",
      };
    }),

  // Manager Review decision — the only path that writes a B2BQuotationApproval row.
  decideQuotation: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        decision: z.enum(B2BQuotationApprovalDecisionEnum),
        reason: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BQuotation.findFirst({
          where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
          select: { status: true },
        });
        if (!existing) {
          throw readFailedNotFound("quotation");
        }
        if (existing.status !== "MANAGER_REVIEW") {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Only a quotation in Manager Review can be decided.",
          });
        }

        const nextStatus: B2BQuotationStatusEnum =
          opts.input.decision === "APPROVED"
            ? "APPROVED"
            : opts.input.decision === "NEEDS_REVISION"
              ? "NEEDS_REVISION"
              : "REJECTED";

        await tx.b2BQuotation.update({
          where: { id: opts.input.id },
          data: { status: nextStatus },
        });
        await tx.b2BQuotationApproval.create({
          data: {
            quotation_id: opts.input.id,
            decision: opts.input.decision,
            reason: opts.input.reason,
            actor_id: opts.ctx.user.id,
          },
        });
      });

      return {
        code: STATUS_OK,
        message: "Decision recorded",
      };
    }),

  // Post-approval client-facing lifecycle: Approved -> Sent -> Accepted/Rejected/Expired.
  updateQuotationOutcome: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        status: z.enum(["SENT", "ACCEPTED", "REJECTED", "EXPIRED"]),
      })
    )
    .mutation(async (opts) => {
      const existing = await opts.ctx.prisma.b2BQuotation.findFirst({
        where: { id: opts.input.id, ...quotationDataScopeWhere(opts.ctx.user) },
        select: { status: true },
      });
      if (!existing) {
        throw readFailedNotFound("quotation");
      }

      const legalTransitions: Record<string, string[]> = {
        APPROVED: ["SENT"],
        SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
      };
      if (!legalTransitions[existing.status]?.includes(opts.input.status)) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: `Cannot move a quotation from ${existing.status} to ${opts.input.status}.`,
        });
      }

      await opts.ctx.prisma.b2BQuotation.update({
        where: { id: opts.input.id },
        data: { status: opts.input.status },
      });

      return {
        code: STATUS_OK,
        message: "Quotation status updated",
      };
    }),

};
