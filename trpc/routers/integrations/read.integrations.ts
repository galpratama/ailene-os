import { STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";

export const readIntegrations = {
  googleCalendarConnection: loggedInProcedure.query(async (opts) => {
    const connection = await opts.ctx.prisma.googleCalendarConnection.findUnique({
      where: { user_id: opts.ctx.user.id },
    });

    return {
      code: STATUS_OK,
      message: "Success",
      connection: connection
        ? {
            google_calendar_id: connection.google_calendar_id,
            connected_at: connection.connected_at,
          }
        : null,
    };
  }),
};
