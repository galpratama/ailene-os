import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { calculatePage } from "@/trpc/utils/paging";
import { numberIsPosInt } from "@/trpc/utils/validation";
import z from "zod";

export const listNotification = {
  mine: loggedInProcedure
    .input(
      z.object({
        unread_only: z.boolean().default(false),
        page: numberIsPosInt().optional(),
        page_size: numberIsPosInt().optional(),
      })
    )
    .query(async (opts) => {
      const whereClause = {
        user_id: opts.ctx.user.id,
        ...(opts.input.unread_only && { read_at: null }),
      };

      const paging = calculatePage(
        opts.input,
        await opts.ctx.prisma.notification.aggregate({
          _count: true,
          where: whereClause,
        })
      );

      const list = await opts.ctx.prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip: paging.prisma.skip,
        take: paging.prisma.take,
      });

      return {
        code: STATUS_OK,
        message: "Success",
        list,
        metapaging: paging.metapaging,
      };
    }),

  unreadCount: loggedInProcedure.query(async (opts) => {
    const count = await opts.ctx.prisma.notification.count({
      where: { user_id: opts.ctx.user.id, read_at: null },
    });
    return {
      code: STATUS_OK,
      message: "Success",
      count,
    };
  }),
};
