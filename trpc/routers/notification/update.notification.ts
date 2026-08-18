import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { checkUpdateResult } from "@/trpc/utils/errors";
import { numberIsID } from "@/trpc/utils/validation";
import z from "zod";

export const updateNotification = {
  markRead: loggedInProcedure
    .input(z.object({ id: numberIsID() }))
    .mutation(async (opts) => {
      const updated = await opts.ctx.prisma.notification.updateMany({
        where: { id: opts.input.id, user_id: opts.ctx.user.id },
        data: { read_at: new Date() },
      });
      await checkUpdateResult(updated.count, "notification", "notifications");
      return {
        code: STATUS_OK,
        message: "Notification marked as read",
      };
    }),

  markAllRead: loggedInProcedure.mutation(async (opts) => {
    const updated = await opts.ctx.prisma.notification.updateMany({
      where: { user_id: opts.ctx.user.id, read_at: null },
      data: { read_at: new Date() },
    });
    return {
      code: STATUS_OK,
      message: "Notifications marked as read",
      count: updated.count,
    };
  }),
};
