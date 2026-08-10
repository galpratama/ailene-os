import { STATUS_OK } from "@/lib/status_code";
import { roleBasedProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyUUID } from "@/trpc/utils/validation";

export const readUserData = {
  // Single user detail plus an ownership summary for the offboard drawer.
  user: roleBasedProcedure(["Administrator", "Super Admin", "Manager"])
    .input(objectHasOnlyUUID())
    .query(async (opts) => {
      const user = await opts.ctx.prisma.user.findUnique({
        where: { id: opts.input.id },
        include: { role: true, team: true },
      });
      if (!user) throw readFailedNotFound("user");

      const [pipelinesOwned, actionsAssigned] = await Promise.all([
        opts.ctx.prisma.b2BPipeline.count({ where: { owner_id: user.id } }),
        opts.ctx.prisma.b2BAction.count({ where: { assignee_id: user.id } }),
      ]);

      return {
        code: STATUS_OK,
        message: "Success",
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          avatar: user.avatar,
          role_id: user.role_id,
          role_name: user.role.name,
          team_id: user.team_id,
          team_name: user.team?.name ?? null,
          job_function: user.job_function,
          data_scope: user.data_scope,
          status: user.status,
          created_at: user.created_at,
          last_login: user.last_login,
        },
        ownership: {
          pipelines_owned: pipelinesOwned,
          actions_assigned: actionsAssigned,
        },
      };
    }),
};
