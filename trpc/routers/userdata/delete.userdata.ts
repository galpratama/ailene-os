import { STATUS_NO_CONTENT } from "@/lib/status_code";
import { roleBasedProcedure } from "@/trpc/init";
import { checkDeleteResult } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";

// User deletion is intentionally not offered here — only Team (a plain lookup value) can be deleted.
export const deleteUserData = {
  team: roleBasedProcedure(["Administrator", "Super Admin"])
    .input(objectHasOnlyID())
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.prisma.team.deleteMany({
        where: { id: input.id, users: { none: {} } },
      });
      await checkDeleteResult(deleted.count, "teams", "userdata.team");
      return { code: STATUS_NO_CONTENT, message: "Team deleted" };
    }),
};
