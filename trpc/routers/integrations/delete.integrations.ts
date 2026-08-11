import { STATUS_NO_CONTENT } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";

export const deleteIntegrations = {
  // Idempotent — disconnecting when nothing is connected is a no-op, not an error.
  googleCalendarConnection: loggedInProcedure.mutation(async (opts) => {
    await opts.ctx.prisma.googleCalendarConnection.deleteMany({
      where: { user_id: opts.ctx.user.id },
    });

    return {
      code: STATUS_NO_CONTENT,
      message: "Google Calendar disconnected",
    };
  }),
};
