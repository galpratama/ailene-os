import {
  STATUS_BAD_REQUEST,
  STATUS_FORBIDDEN,
  STATUS_OK,
} from "@/lib/status_code";
import { roleBasedProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { canGrantRole } from "@/trpc/utils/role_hierarchy";
import { isValidStatusTransition } from "@/trpc/utils/user_status";
import {
  numberIsID,
  stringIsUUID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  DataScopeEnum,
  JobFunctionEnum,
  UserAccountStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

type AuditRow = {
  target_user_id: string;
  actor_id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  reason?: string;
};

export const updateUserData = {
  // Role/team/job_function/data_scope edits; grant-hierarchy checked against both current and requested role.
  profile: roleBasedProcedure(["Administrator", "Super Admin"])
    .input(
      z.object({
        id: stringIsUUID(),
        role_id: numberIsID().optional(),
        team_id: numberIsID().nullable().optional(),
        job_function: z.enum(JobFunctionEnum).nullable().optional(),
        data_scope: z.enum(DataScopeEnum).optional(),
        reason: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, role_id, team_id, job_function, data_scope, reason } =
        opts.input;

      await opts.ctx.prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({
          where: { id },
          include: { role: true, team: true },
        });
        if (!existing) throw readFailedNotFound("user");

        let targetRoleName: string | undefined;
        if (role_id !== undefined && role_id !== existing.role_id) {
          const targetRole = await tx.role.findUnique({
            where: { id: role_id },
          });
          if (!targetRole) {
            throw new TRPCError({
              code: STATUS_BAD_REQUEST,
              message: "The selected access role does not exist.",
            });
          }
          const actorRoleName = opts.ctx.user.role.name;
          if (
            !canGrantRole(actorRoleName, targetRole.name) ||
            !canGrantRole(actorRoleName, existing.role.name)
          ) {
            throw new TRPCError({
              code: STATUS_FORBIDDEN,
              message: "You are not allowed to change this user's role.",
            });
          }
          targetRoleName = targetRole.name;
        }

        const updated = await tx.user.update({
          where: { id },
          data: {
            ...(role_id !== undefined && { role_id }),
            ...(team_id !== undefined && { team_id }),
            ...(job_function !== undefined && { job_function }),
            ...(data_scope !== undefined && { data_scope }),
          },
          include: { team: true },
        });

        const auditRows: AuditRow[] = [];
        if (role_id !== undefined && role_id !== existing.role_id) {
          auditRows.push({
            target_user_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: "role",
            old_value: existing.role.name,
            new_value: targetRoleName!,
            reason,
          });
        }
        if (team_id !== undefined && team_id !== existing.team_id) {
          auditRows.push({
            target_user_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: "team",
            old_value: existing.team?.name ?? null,
            new_value: updated.team?.name ?? null,
            reason,
          });
        }
        if (
          job_function !== undefined &&
          job_function !== existing.job_function
        ) {
          auditRows.push({
            target_user_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: "job_function",
            old_value: existing.job_function,
            new_value: job_function,
            reason,
          });
        }
        if (data_scope !== undefined && data_scope !== existing.data_scope) {
          auditRows.push({
            target_user_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: "data_scope",
            old_value: existing.data_scope,
            new_value: data_scope,
            reason,
          });
        }
        if (auditRows.length) {
          await tx.userAuditLog.createMany({ data: auditRows });
        }
      });

      return { code: STATUS_OK, message: "User updated" };
    }),

  // Account lifecycle transitions, validated against the state machine in user_status.ts.
  status: roleBasedProcedure(["Administrator", "Super Admin"])
    .input(
      z.object({
        id: stringIsUUID(),
        status: z.enum(UserAccountStatusEnum),
        reason: stringNotBlank().optional(),
      })
    )
    .mutation(async (opts) => {
      const { id, status, reason } = opts.input;

      const existing = await opts.ctx.prisma.user.findUnique({
        where: { id },
      });
      if (!existing) throw readFailedNotFound("user");

      if (!isValidStatusTransition(existing.status, status)) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: `Cannot move a user from ${existing.status} to ${status}.`,
        });
      }

      await opts.ctx.prisma.$transaction([
        opts.ctx.prisma.user.update({ where: { id }, data: { status } }),
        opts.ctx.prisma.userAuditLog.create({
          data: {
            target_user_id: id,
            actor_id: opts.ctx.user.id,
            field_changed: "status",
            old_value: existing.status,
            new_value: status,
            reason,
          },
        }),
      ]);

      return { code: STATUS_OK, message: "User status updated" };
    }),

  // Reassigns every owned pipeline/action from one user to another, one OwnershipReassignment row per record.
  reassignOwnership: roleBasedProcedure(["Administrator", "Super Admin", "Manager"])
    .input(
      z.object({
        from_user_id: stringIsUUID(),
        to_user_id: stringIsUUID(),
        reason: stringNotBlank(),
      })
    )
    .mutation(async (opts) => {
      const { from_user_id, to_user_id, reason } = opts.input;

      if (from_user_id === to_user_id) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Cannot reassign a user's work to themselves.",
        });
      }

      const [fromUser, toUser] = await Promise.all([
        opts.ctx.prisma.user.findUnique({ where: { id: from_user_id } }),
        opts.ctx.prisma.user.findUnique({ where: { id: to_user_id } }),
      ]);
      if (!fromUser || !toUser) throw readFailedNotFound("user");

      const isManager = opts.ctx.user.role.name === "Manager";
      if (
        isManager &&
        (opts.ctx.user.team_id === null ||
          fromUser.team_id !== opts.ctx.user.team_id ||
          toUser.team_id !== opts.ctx.user.team_id)
      ) {
        throw new TRPCError({
          code: STATUS_FORBIDDEN,
          message: "Managers can only reassign ownership within their own team.",
        });
      }

      const result = await opts.ctx.prisma.$transaction(async (tx) => {
        const [pipelines, actions, meetings] = await Promise.all([
          tx.b2BPipeline.findMany({
            where: { owner_id: from_user_id },
            select: { id: true },
          }),
          tx.b2BAction.findMany({
            where: { assignee_id: from_user_id },
            select: { id: true },
          }),
          tx.b2BMeeting.findMany({
            where: { organizer_id: from_user_id },
            select: { id: true },
          }),
        ]);

        for (const { id: pipelineId } of pipelines) {
          const firstReassignment = await tx.ownershipReassignment.findFirst({
            where: { entity_type: "B2B_PIPELINE", entity_id: pipelineId },
            orderBy: { created_at: "asc" },
          });
          await tx.ownershipReassignment.create({
            data: {
              entity_type: "B2B_PIPELINE",
              entity_id: pipelineId,
              original_creator_id:
                firstReassignment?.original_creator_id ?? from_user_id,
              previous_owner_id: from_user_id,
              new_owner_id: to_user_id,
              actor_id: opts.ctx.user.id,
              reason,
            },
          });
          await tx.b2BPipeline.update({
            where: { id: pipelineId },
            data: { owner_id: to_user_id },
          });
        }

        for (const { id: actionId } of actions) {
          const firstReassignment = await tx.ownershipReassignment.findFirst({
            where: { entity_type: "B2B_ACTION", entity_id: actionId },
            orderBy: { created_at: "asc" },
          });
          await tx.ownershipReassignment.create({
            data: {
              entity_type: "B2B_ACTION",
              entity_id: actionId,
              original_creator_id:
                firstReassignment?.original_creator_id ?? from_user_id,
              previous_owner_id: from_user_id,
              new_owner_id: to_user_id,
              actor_id: opts.ctx.user.id,
              reason,
            },
          });
          await tx.b2BAction.update({
            where: { id: actionId },
            data: { assignee_id: to_user_id },
          });
        }

        for (const { id: meetingId } of meetings) {
          const firstReassignment = await tx.ownershipReassignment.findFirst({
            where: { entity_type: "B2B_MEETING", entity_id: meetingId },
            orderBy: { created_at: "asc" },
          });
          await tx.ownershipReassignment.create({
            data: {
              entity_type: "B2B_MEETING",
              entity_id: meetingId,
              original_creator_id:
                firstReassignment?.original_creator_id ?? from_user_id,
              previous_owner_id: from_user_id,
              new_owner_id: to_user_id,
              actor_id: opts.ctx.user.id,
              reason,
            },
          });
          await tx.b2BMeeting.update({
            where: { id: meetingId },
            data: { organizer_id: to_user_id },
          });
        }

        return {
          pipelines: pipelines.length,
          actions: actions.length,
          meetings: meetings.length,
        };
      });

      return {
        code: STATUS_OK,
        message: "Ownership reassigned",
        reassigned: result,
      };
    }),
};
