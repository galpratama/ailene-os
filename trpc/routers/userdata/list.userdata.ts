import { Optional } from "@/lib/optional-type";
import { STATUS_OK } from "@/lib/status_code";
import { roleBasedProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import {
  numberIsID,
  numberIsPosInt,
  numberIsRoleID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import { UserAccountStatusEnum } from "@prisma/client";
import z from "zod";

export const listUserData = {
  // Manager is included since LeadsPageOS's owner picker and reassignment need it too.
  users: roleBasedProcedure(["Administrator", "Super Admin", "Manager"])
    .input(
      z.object({
        role_ids: z.array(numberIsRoleID()).nonempty().optional(),
        team_id: numberIsID().optional(),
        status: z.enum(UserAccountStatusEnum).optional(),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
        keyword: stringNotBlank().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause = {
        role_id: opts.input.role_ids ? { in: opts.input.role_ids } : undefined,
        team_id: opts.input.team_id,
        status: opts.input.status,
        OR: undefined as Optional<
          [
            { full_name: { contains: string; mode: "insensitive" } },
            { email: { contains: string; mode: "insensitive" } },
          ]
        >,
        deleted_at: null,
      };

      if (opts.input.keyword !== undefined) {
        whereClause.OR = [
          { full_name: { contains: opts.input.keyword, mode: "insensitive" } },
          { email: { contains: opts.input.keyword, mode: "insensitive" } },
        ];
      }

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.user.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const userList = await opts.ctx.prisma.user.findMany({
        include: { role: true, team: true },
        orderBy: [{ full_name: "asc" }],
        where: whereClause,
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list: userList.map((entry) => ({
          id: entry.id,
          full_name: entry.full_name,
          email: entry.email,
          avatar: entry.avatar,
          role_id: entry.role_id,
          role_name: entry.role.name,
          team_id: entry.team_id,
          team_name: entry.team?.name ?? null,
          job_function: entry.job_function,
          data_scope: entry.data_scope,
          status: entry.status,
          created_at: entry.created_at,
          last_login: entry.last_login,
        })),
        metapaging: {
          ...paging.metapaging,
          keyword: opts.input.keyword,
        },
      };
    }),

  teams: roleBasedProcedure(["Administrator", "Super Admin"]).query(
    async ({ ctx }) => {
      const list = await ctx.prisma.team.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: [{ name: "asc" }],
      });
      return {
        code: STATUS_OK,
        message: "Success",
        list: list.map((entry) => ({
          id: entry.id,
          name: entry.name,
          user_count: entry._count.users,
        })),
      };
    }
  ),
};
