import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { numberIsID, stringNotBlank } from "@/trpc/utils/validation";
import { DataScopeEnum, JobFunctionEnum, UserRoleEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const createUserData = {
  // Pre-creates the account as INVITED; activates on first Google sign-in (see auth.ts).
  user: administratorProcedure
    .input(
      z.object({
        full_name: stringNotBlank(),
        email: z.email(),
        role: z.enum(UserRoleEnum),
        team_id: numberIsID().nullable().optional(),
        job_function: z.enum(JobFunctionEnum).nullable().optional(),
        data_scope: z.enum(DataScopeEnum).optional(),
      })
    )
    .mutation(async (opts) => {
      const { role, team_id, job_function, data_scope, ...rest } = opts.input;

      const existing = await opts.ctx.prisma.user.findUnique({
        where: { email: rest.email },
      });
      if (existing) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "A user with this email already exists.",
        });
      }

      const created = await opts.ctx.prisma.user.create({
        data: {
          ...rest,
          role,
          team_id: team_id ?? null,
          job_function: job_function ?? null,
          data_scope: data_scope ?? "OWN",
          status: "INVITED",
          invited_by_id: opts.ctx.user.id,
          invited_at: new Date(),
        },
      });

      await opts.ctx.prisma.userAuditLog.create({
        data: {
          target_user_id: created.id,
          actor_id: opts.ctx.user.id,
          field_changed: "invited",
          new_value: role,
        },
      });

      return {
        code: STATUS_OK,
        message: "User invited",
        user: created,
      };
    }),

  team: administratorProcedure
    .input(z.object({ name: stringNotBlank() }))
    .mutation(async (opts) => {
      const created = await opts.ctx.prisma.team.create({
        data: { name: opts.input.name },
      });
      return {
        code: STATUS_OK,
        message: "Team created",
        team: created,
      };
    }),
};
