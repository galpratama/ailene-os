import { STATUS_BAD_REQUEST, STATUS_FORBIDDEN, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, roleBasedProcedure } from "@/trpc/init";
import { actionDataScopeWhere, isOwnerWithinScope } from "@/trpc/utils/data_scope";
import { upsertPrimaryContact } from "@/trpc/utils/organization_contact";
import { normalizeOrgName } from "@/trpc/utils/organization_dedupe";
import { checkUpdateResult, readFailedNotFound } from "@/trpc/utils/errors";
import {
  numberIsID,
  numberIsPosInt,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BActionPriorityEnum,
  B2BActionStatusEnum,
  B2BLostReasonEnum,
  B2BProbabilityStatusEnum,
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
      const updated = await opts.ctx.prisma.b2BAction.updateMany({
        where: { id, ...actionDataScopeWhere(opts.ctx.user) },
        data: {
          ...rest,
          ...(due_date !== undefined && {
            due_date: due_date ? new Date(due_date) : null,
          }),
        },
      });
      await checkUpdateResult(updated.count, "action", "actions");
      return {
        code: STATUS_OK,
        message: "Action updated",
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
