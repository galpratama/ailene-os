import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

export const readLms = {
  project: administratorProcedure
    .input(objectHasOnlyID())
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.lmsProject.findFirst({
        where: { id: input.id },
        include: {
          company: { select: { id: true, name: true } },
          pipeline: { select: { id: true, name: true } },
          groups: {
            include: {
              champion: { select: { id: true, job_title: true, user_id: true } },
              _count: { select: { members: true } },
            },
            orderBy: [{ created_at: "desc" }],
          },
        },
      });
      if (!project) throw readFailedNotFound("project");

      // lms_members.user_id is an unconstrained UUID (Sevenpreneur or
      // ailene-os identity space), so it can't be a Prisma relation — look
      // up display names for known ailene-os users separately.
      const championUserIds = project.groups.map((group) => group.champion.user_id);
      const championUsers = await ctx.prisma.user.findMany({
        where: { id: { in: championUserIds } },
        select: { id: true, full_name: true },
      });
      const championNameByUserId = new Map(
        championUsers.map((user) => [user.id, user.full_name])
      );

      return {
        code: STATUS_OK,
        message: "Success",
        project: {
          id: project.id,
          name: project.name,
          company_id: project.company?.id ?? null,
          company_name: project.company?.name ?? null,
          pipeline_id: project.pipeline.id,
          pipeline_name: project.pipeline.name,
          created_at: project.created_at,
          groups: project.groups.map((group) => ({
            id: group.id,
            name: group.name,
            champion_id: group.champion.id,
            champion_name:
              championNameByUserId.get(group.champion.user_id) ??
              group.champion.job_title,
            member_count: group._count.members,
          })),
        },
      };
    }),
};
