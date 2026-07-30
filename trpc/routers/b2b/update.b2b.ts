import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { checkUpdateResult } from "@/trpc/utils/errors";
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
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

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
      })
    )
    .mutation(async (opts) => {
      const { id, ...data } = opts.input;
      const updated = await opts.ctx.prisma.b2BCompany.updateMany({
        where: { id },
        data,
      });
      await checkUpdateResult(updated.count, "company", "companies");
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
        probability: z.number().int().min(0).max(100).optional(),
        probability_status: z.enum(B2BProbabilityStatusEnum).optional(),
        project_value: z.number().nonnegative().optional(),
        project_start_month: monthDate.nullable().optional(),
        project_end_month: monthDate.nullable().optional(),
        owner_id: stringIsUUID().optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        id,
        project_start_month,
        project_end_month,
        reason_code,
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

      // Business Development can only update a pipeline they own.
      const isBusinessDevelopment =
        opts.ctx.user.role.name === "Business Development";
      const REASON_STAGES: B2BStageEnum[] = [
        B2BStageEnum.CLOSED_LOST,
        B2BStageEnum.ON_HOLD,
      ];

      const updated = await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.b2BPipeline.findUnique({
          where: { id },
          select: { stage: true, owner_id: true },
        });
        if (
          !existing ||
          (isBusinessDevelopment && existing.owner_id !== opts.ctx.user.id)
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
        // Correcting the reason on an already On Hold/Closed Lost lead — no history row, since nothing transitioned.
        const correctsReasonInPlace =
          !stageChanged &&
          reason_code !== undefined &&
          REASON_STAGES.includes(existing.stage);

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
        where: { id },
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
};
