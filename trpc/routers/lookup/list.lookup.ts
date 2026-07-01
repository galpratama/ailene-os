import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";

export const listLookup = {
  roles: loggedInProcedure.query(async (opts) => {
    const roleList = await opts.ctx.prisma.role.findMany({
      orderBy: [{ id: "asc" }],
    });
    return {
      code: STATUS_OK,
      message: "Success",
      list: roleList.map((entry) => ({
        id: entry.id,
        name: entry.name,
      })),
    };
  }),

  industries: loggedInProcedure.query(async (opts) => {
    const industryList = await opts.ctx.prisma.industry.findMany({
      orderBy: [{ industry_name: "asc" }, { id: "asc" }],
    });
    return {
      code: STATUS_OK,
      message: "Success",
      list: industryList.map((entry) => ({
        id: entry.id,
        name: entry.industry_name,
      })),
    };
  }),
};
