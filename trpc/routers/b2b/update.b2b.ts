import { pushMeetingToGoogleCalendar } from "@/lib/google-calendar";
import { calculatePricing } from "@/lib/pricing-b2b";
import { STATUS_BAD_REQUEST, STATUS_FORBIDDEN, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, roleBasedProcedure } from "@/trpc/init";
import {
  actionDataScopeWhere,
  isOwnerWithinScope,
  meetingDataScopeWhere,
  quotationDataScopeWhere,
} from "@/trpc/utils/data_scope";
import { upsertPrimaryContact } from "@/trpc/utils/organization_contact";
import { normalizeOrgName } from "@/trpc/utils/organization_dedupe";
import { checkUpdateResult, readFailedNotFound } from "@/trpc/utils/errors";
import { notifyUsers } from "@/trpc/utils/notification";
import {
  quotationInputShape,
  requirePackageType,
} from "@/trpc/routers/b2b/create.b2b";
import { computeRequiresReview, toPricingState } from "@/trpc/utils/quotation";
import {
  numberIsID,
  numberIsPosInt,
  stringIsTimestampTz,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BLostReasonEnum,
  B2BMeetingStatusEnum,
  B2BProbabilityStatusEnum,
  B2BQuotationApprovalDecisionEnum,
  B2BQuotationStatusEnum,
  B2BStageEnum,
  OrganizationStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

type AuditRow = {
  target_entity_type: "ORGANIZATION" | "CONTACT";
  target_entity_id: number;
  actor_id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
};

// "YYYY-MM-DD" string from frontend. Day expected to be 01 by convention.
const monthDate = z.iso.date();

export const updateB2B = {
  company: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        industry_id: numberIsPosInt().optional(),
        pic_name: stringNotBlank().nullable().optional(),
        pic_job_title: stringNotBlank().nullable().optional(),
        pic_wa: stringNotBlank().nullable().optional(),
        pic_email: stringNotBlank().nullable().optional(),
        image_url: z.url().nullable().optional(),
        status: z.enum(OrganizationStatusEnum).optional(),
        aliases: z.array(stringNotBlank()).optional(),
        legal_identifier: stringNotBlank().nullable().optional(),
        reason: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, reason, ...data } = opts.input;

      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BCompany.findUnique({ where: { id } });
        if (!existing) throw readFailedNotFound("company");

        const auditRows: AuditRow[] = [];
        const trackedFields: (keyof typeof data)[] = [
          "name",
          "industry_id",
          "pic_name",
          "pic_job_title",
          "pic_wa",
          "pic_email",
          "status",
          "legal_identifier",
        ];
        for (const field of trackedFields) {
          const nextValue = data[field];
          if (nextValue === undefined) continue;
          const prevValue = existing[field as keyof typeof existing];
          if (String(prevValue ?? "") === String(nextValue ?? "")) continue;
          auditRows.push({
            target_entity_type: "ORGANIZATION",
            target_entity_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: field,
            old_value: prevValue == null ? null : String(prevValue),
            new_value: nextValue == null ? null : String(nextValue),
          });
        }

        const updated = await tx.b2BCompany.updateMany({
          where: { id },
          data: {
            ...data,
            ...(data.name !== undefined && {
              normalized_name: normalizeOrgName(data.name),
            }),
            ...(data.status === "ARCHIVED" && { archived_at: new Date() }),
            ...(data.status !== undefined &&
              data.status !== "ARCHIVED" && { archived_at: null }),
          },
        });
        await checkUpdateResult(updated.count, "company", "companies");

        if (data.pic_name !== undefined) {
          await upsertPrimaryContact(tx, id, data);
        }
        if (auditRows.length) {
          await tx.masterDataAuditLog.createMany({
            data: auditRows.map((row) => ({ ...row, reason })),
          });
        }
      });

      return {
        code: STATUS_OK,
        message: "Company updated",
      };
    }),

  pipeline: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        company_id: numberIsID().optional(),
        stage: z.enum(B2BStageEnum).optional(),
        // Only recorded when `stage` moves into CLOSED_LOST/ON_HOLD (REASON_STAGES below) — ignored otherwise.
        reason_code: z.enum(B2BLostReasonEnum).optional(),
        // Only recorded when `stage` moves into ON_HOLD, or corrected while already ON_HOLD — ignored otherwise.
        on_hold_review_date: monthDate.nullable().optional(),
        probability: z.number().int().min(0).max(100).optional(),
        probability_status: z.enum(B2BProbabilityStatusEnum).optional(),
        project_value: z.number().nonnegative().optional(),
        project_start_month: monthDate.nullable().optional(),
        project_end_month: monthDate.nullable().optional(),
        owner_id: stringIsUUID().optional(),
        // Required when owner_id actually changes the pipeline's owner — the reason recorded on the append-only OwnershipReassignment trail.
        reassignment_reason: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        id,
        project_start_month,
        project_end_month,
        reason_code,
        on_hold_review_date,
        reassignment_reason,
        ...rest
      } = opts.input;

      if (
        project_start_month &&
        project_end_month &&
        new Date(project_end_month) < new Date(project_start_month)
      ) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "project_end_month must be on or after project_start_month.",
        });
      }

      const REASON_STAGES: B2BStageEnum[] = [
        B2BStageEnum.CLOSED_LOST,
        B2BStageEnum.ON_HOLD,
      ];

      const updated = await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BPipeline.findUnique({
          where: { id },
          select: {
            stage: true,
            owner_id: true,
            owner: { select: { team_id: true } },
          },
        });
        if (
          !existing ||
          !isOwnerWithinScope(
            opts.ctx.user,
            existing.owner_id,
            existing.owner.team_id
          )
        ) {
          return null;
        }

        const nextStage = rest.stage ?? existing.stage;
        const stageChanged =
          rest.stage !== undefined && rest.stage !== existing.stage;
        const entersReasonStage =
          stageChanged && REASON_STAGES.includes(nextStage);
        const leavesReasonStage =
          stageChanged &&
          !entersReasonStage &&
          REASON_STAGES.includes(existing.stage);
        // Correcting the reason/review date on an already On Hold/Closed Lost lead — no history row, since nothing transitioned.
        const correctsReasonInPlace =
          !stageChanged &&
          (reason_code !== undefined || on_hold_review_date !== undefined) &&
          REASON_STAGES.includes(existing.stage);

        if (entersReasonStage && nextStage === "CLOSED_LOST" && !reason_code) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "A lost reason is required when moving a lead to Closed Lost.",
          });
        }
        if (
          entersReasonStage &&
          nextStage === "ON_HOLD" &&
          !on_hold_review_date
        ) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "A review date is required when putting a lead on hold.",
          });
        }

        // Owner reassignment: require a reason and record it on the append-only trail, mirroring
        // the bulk offboarding reassignment in userdata/update.userdata.ts.
        const ownerChanged =
          rest.owner_id !== undefined && rest.owner_id !== existing.owner_id;
        if (ownerChanged && opts.ctx.user.data_scope === "OWN") {
          throw new TRPCError({
            code: STATUS_FORBIDDEN,
            message: "You can't reassign a lead to another owner.",
          });
        }
        if (ownerChanged && !reassignment_reason) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "A reason is required when reassigning a lead's owner.",
          });
        }

        const row = await tx.b2BPipeline.update({
          where: { id },
          data: {
            ...rest,
            ...(project_start_month !== undefined && {
              project_start_month: project_start_month
                ? new Date(project_start_month)
                : null,
            }),
            ...(project_end_month !== undefined && {
              project_end_month: project_end_month
                ? new Date(project_end_month)
                : null,
            }),
            ...((entersReasonStage || correctsReasonInPlace) && {
              current_stage_reason_code: reason_code ?? null,
            }),
            ...(leavesReasonStage && { current_stage_reason_code: null }),
            ...((entersReasonStage || correctsReasonInPlace) && {
              on_hold_review_date: on_hold_review_date
                ? new Date(on_hold_review_date)
                : null,
            }),
            ...(leavesReasonStage && { on_hold_review_date: null }),
          },
        });

        if (stageChanged) {
          await tx.b2BPipelineStageHistory.create({
            data: {
              pipeline_id: id,
              from_stage: existing.stage,
              to_stage: nextStage,
              reason_code: entersReasonStage ? (reason_code ?? null) : null,
              changed_by_id: opts.ctx.user.id,
            },
          });
        }

        if (ownerChanged) {
          const firstReassignment = await tx.ownershipReassignment.findFirst({
            where: { entity_type: "B2B_PIPELINE", entity_id: id },
            orderBy: { created_at: "asc" },
          });
          await tx.ownershipReassignment.create({
            data: {
              entity_type: "B2B_PIPELINE",
              entity_id: id,
              original_creator_id:
                firstReassignment?.original_creator_id ?? existing.owner_id,
              previous_owner_id: existing.owner_id,
              new_owner_id: rest.owner_id!,
              actor_id: opts.ctx.user.id,
              reason: reassignment_reason!,
            },
          });
        }

        // A closed-won deal graduates its organization from Prospect to Customer.
        if (stageChanged && nextStage === "CLOSED_WON") {
          await tx.b2BCompany.updateMany({
            where: { id: row.company_id, status: "PROSPECT" },
            data: { status: "CUSTOMER" },
          });
        }

        return row;
      });

      await checkUpdateResult(updated ? 1 : 0, "pipeline", "pipelines");
      return {
        code: STATUS_OK,
        message: "Pipeline updated",
      };
    }),

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
        attendee_contact_ids: z.array(numberIsID()).optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        id,
        scheduled_at,
        held_at,
        organizer_id,
        attendee_contact_ids,
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

        if (attendee_contact_ids !== undefined) {
          await tx.b2BMeetingAttendee.deleteMany({ where: { meeting_id: id } });
          if (attendee_contact_ids.length > 0) {
            await tx.b2BMeetingAttendee.createMany({
              data: attendee_contact_ids.map((contact_id) => ({
                meeting_id: id,
                contact_id,
              })),
            });
          }
        }
      });

      const updatedMeeting = await opts.ctx.prisma.b2BMeeting.findUnique({
        where: { id },
        include: { pipeline: { include: { company: { select: { name: true } } } } },
      });
      if (updatedMeeting) {
        await pushMeetingToGoogleCalendar(opts.ctx.prisma, {
          ...updatedMeeting,
          pipeline_name: updatedMeeting.pipeline.name,
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
  decideQuotation: roleBasedProcedure(["Manager", "Administrator", "Super Admin"])
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

  contact: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        full_name: stringNotBlank().optional(),
        email: z.email().nullable().optional(),
        phone: stringNotBlank().nullable().optional(),
        job_title: stringNotBlank().nullable().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      const updated = await opts.ctx.prisma.contact.updateMany({
        where: { id },
        data,
      });
      await checkUpdateResult(updated.count, "contact", "contacts");
      return {
        code: STATUS_OK,
        message: "Contact updated",
      };
    }),

  resolveOrganizationDuplicateReview: roleBasedProcedure([
    "Administrator",
    "Super Admin",
    "Manager",
  ])
    .input(
      z.object({
        id: numberIsID(),
        resolution: z.enum(["LINKED_EXISTING", "CREATED_NEW", "DISMISSED"]),
        resolved_organization_id: numberIsID().optional(),
        resolution_note: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, resolution, resolution_note } = opts.input;

      await opts.ctx.prisma.$transaction(async (tx) => {
        const review = await tx.organizationDuplicateReview.findUnique({
          where: { id },
        });
        if (!review) throw readFailedNotFound("duplicate review");
        if (review.status !== "PENDING") {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "This duplicate review has already been resolved.",
          });
        }

        let resolvedOrganizationId: number | null = null;

        if (resolution === "LINKED_EXISTING") {
          if (!opts.input.resolved_organization_id) {
            throw new TRPCError({
              code: STATUS_BAD_REQUEST,
              message: "resolved_organization_id is required to link an existing organization.",
            });
          }
          const target = await tx.b2BCompany.findUnique({
            where: { id: opts.input.resolved_organization_id },
            select: { id: true },
          });
          if (!target) throw readFailedNotFound("organization");
          resolvedOrganizationId = target.id;
        } else if (resolution === "CREATED_NEW") {
          if (!review.proposed_industry_id) {
            throw new TRPCError({
              code: STATUS_BAD_REQUEST,
              message: "This review has no proposed industry; edit it before creating the organization.",
            });
          }
          const created = await tx.b2BCompany.create({
            data: {
              name: review.proposed_name,
              normalized_name: normalizeOrgName(review.proposed_name),
              industry_id: review.proposed_industry_id,
              pic_name: review.proposed_pic_name,
              pic_job_title: review.proposed_pic_job_title,
              pic_wa: review.proposed_pic_wa,
              pic_email: review.proposed_pic_email,
            },
          });
          await upsertPrimaryContact(tx, created.id, {
            pic_name: review.proposed_pic_name,
            pic_job_title: review.proposed_pic_job_title,
            pic_wa: review.proposed_pic_wa,
            pic_email: review.proposed_pic_email,
          });
          resolvedOrganizationId = created.id;
        }

        await tx.organizationDuplicateReview.update({
          where: { id },
          data: {
            status: resolution,
            resolved_organization_id: resolvedOrganizationId,
            resolved_by_id: opts.ctx.user.id,
            resolved_at: new Date(),
            resolution_note,
          },
        });

        if (resolvedOrganizationId) {
          await tx.masterDataAuditLog.create({
            data: {
              target_entity_type: "ORGANIZATION",
              target_entity_id: resolvedOrganizationId,
              actor_id: opts.ctx.user.id,
              field_changed: "duplicate_review_resolved",
              old_value: null,
              new_value: resolution,
              reason: resolution_note,
            },
          });
        }
      });

      return {
        code: STATUS_OK,
        message: "Duplicate review resolved",
      };
    }),
};
