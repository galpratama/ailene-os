import { pushMeetingToGoogleCalendar } from "@/lib/google-calendar";
import { SESI_VALUES, calculatePricing } from "@/lib/pricing-b2b";
import { STATUS_CONFLICT, STATUS_CREATED } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { pipelineDataScopeWhere } from "@/trpc/utils/data_scope";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { notifyUsers } from "@/trpc/utils/notification";
import { computeRequiresReview, toPricingState } from "@/trpc/utils/quotation";
import {
  numberIsID,
  numberIsNonNegInt,
  numberIsPosInt,
  stringIsTimestampTz,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BQuotationMateriLevelEnum,
  B2BQuotationPackageEnum,
  B2BQuotationSessionFormatEnum,
  B2BQuotationSourceTypeEnum,
  B2BQuotationTrainerTierEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

const quotationDayInput = z.object({
  format: z.enum(B2BQuotationSessionFormatEnum),
  sesi: z.literal(SESI_VALUES),
  peserta: numberIsPosInt(),
  trainer: z.enum(B2BQuotationTrainerTierEnum),
});

// Shared, unrefined shape (stays .extend()-able) so update.b2b.ts can reuse it with its own refine.
export const quotationInputShape = z.object({
  source_type: z.enum(B2BQuotationSourceTypeEnum),
  package_type: z.enum(B2BQuotationPackageEnum).optional(),
  materi: z.enum(B2BQuotationMateriLevelEnum).default("STD"),
  bd_pct: z.number().min(0).max(100).default(5),
  dc_pct: z.number().min(0).max(100).default(0),
  addon_assessment: z.boolean().default(false),
  addon_klinik: z.boolean().default(false),
  addon_klinik_sesi: numberIsPosInt().default(1),
  addon_rekaman: z.boolean().default(false),
  addon_sertifikat: z.boolean().default(false),
  addon_sertifikat_qty: numberIsNonNegInt().default(0),
  addon_perjalanan: z.boolean().default(false),
  addon_perjalanan_rp: z.number().nonnegative().default(0),
  days: z.array(quotationDayInput).min(1),
});

export function requirePackageType<T extends typeof quotationInputShape>(
  schema: T
) {
  return schema.refine((v) => v.source_type !== "PACKAGE" || !!v.package_type, {
    message: "package_type is required when source_type is PACKAGE.",
  });
}

// "YYYY-MM-DD" string from frontend. Day expected to be 01 by convention.
const monthDate = z.iso.date();

export const createB2B = {
  action: administratorProcedure
    .input(
      z.object({
        pipeline_id: numberIsID(),
        name: stringNotBlank(),
        summary: stringNotBlank().nullable().optional(),
        status: z.enum(B2BActionStatusEnum).optional(),
        priority: z.enum(B2BActionPriorityEnum).optional(),
        due_date: monthDate.nullable().optional(),
        assignee_id: stringIsUUID().nullable().optional(),
        // Set when this action is the next action created from a Meeting outcome (see b2b.meeting).
        source_meeting_id: numberIsID().optional(),
      })
    )
    .mutation(async (opts) => {
      const pipeline = await opts.ctx.prisma.pipeline.findFirst({
        where: {
          id: opts.input.pipeline_id,
          ...pipelineDataScopeWhere(opts.ctx.user),
        },
        select: { id: true },
      });
      if (!pipeline) {
        throw readFailedNotFound("pipeline");
      }

      const created = await opts.ctx.prisma.$transaction(async (tx) => {
        const row = await tx.b2BAction.create({
          data: {
            pipeline_id: opts.input.pipeline_id,
            name: opts.input.name,
            summary: opts.input.summary ?? null,
            status: opts.input.status,
            priority: opts.input.priority,
            due_date: opts.input.due_date ? new Date(opts.input.due_date) : null,
            assignee_id: opts.input.assignee_id ?? null,
            source_meeting_id: opts.input.source_meeting_id,
          },
        });

        if (row.assignee_id) {
          await notifyUsers(tx, {
            userIds: [row.assignee_id],
            actorId: opts.ctx.user.id,
            type: "NEW_ASSIGNMENT",
            entityType: "B2B_ACTION",
            entityId: row.id,
            message: `You were assigned to "${row.name}".`,
          });
        }

        return row;
      });
      return {
        code: STATUS_CREATED,
        message: "Action created",
        id: created.id,
      };
    }),

  meeting: administratorProcedure
    .input(
      z.object({
        pipeline_id: numberIsID(),
        organizer_id: stringIsUUID().optional(),
        scheduled_at: stringIsTimestampTz(),
        location_or_link: stringNotBlank().nullable().optional(),
        notes: stringNotBlank().nullable().optional(),
        attendee_contact_ids: z.array(numberIsID()).default([]),
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
          attendees: {
            create: opts.input.attendee_contact_ids.map((contact_id) => ({
              contact_id,
            })),
          },
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

  // Only one active (non Rejected/Expired) version may exist per pipeline at a time.
  quotation: administratorProcedure
    .input(
      requirePackageType(
        quotationInputShape.extend({ pipeline_id: numberIsID() })
      )
    )
    .mutation(async (opts) => {
      const { pipeline_id, days, ...rest } = opts.input;

      const created = await opts.ctx.prisma.$transaction(async (tx) => {
        const pipeline = await tx.pipeline.findFirst({
          where: { id: pipeline_id, ...pipelineDataScopeWhere(opts.ctx.user) },
          select: { id: true },
        });
        if (!pipeline) {
          throw readFailedNotFound("pipeline");
        }

        const activeExisting = await tx.b2BQuotation.findFirst({
          where: {
            pipeline_id,
            is_current: true,
            status: { notIn: ["REJECTED", "EXPIRED"] },
          },
          select: { id: true },
        });
        if (activeExisting) {
          throw new TRPCError({
            code: STATUS_CONFLICT,
            message:
              "This pipeline already has an active quotation. Edit it, or wait until it's Rejected/Expired before starting a new one.",
          });
        }

        const lastVersion = await tx.b2BQuotation.findFirst({
          where: { pipeline_id },
          orderBy: { version: "desc" },
          select: { version: true },
        });

        const result = calculatePricing(toPricingState({ ...rest, days }));
        const requiresReview = computeRequiresReview(
          rest.source_type,
          result.margin
        );

        if (lastVersion) {
          await tx.b2BQuotation.updateMany({
            where: { pipeline_id },
            data: { is_current: false },
          });
        }

        return tx.b2BQuotation.create({
          data: {
            pipeline_id,
            version: (lastVersion?.version ?? 0) + 1,
            status: "DRAFT",
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
            created_by_id: opts.ctx.user.id,
            line_items: {
              create: days.map((day, index) => ({
                order_index: index,
                format: day.format,
                sesi: day.sesi,
                peserta: day.peserta,
                trainer: day.trainer,
              })),
            },
          },
        });
      });

      return {
        code: STATUS_CREATED,
        message: "Quotation drafted",
        id: created.id,
        version: created.version,
      };
    }),

};
