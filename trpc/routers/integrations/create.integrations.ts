import { exchangeGoogleAuthCode } from "@/lib/google-calendar";
import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { loggedInProcedure } from "@/trpc/init";
import { stringNotBlank } from "@/trpc/utils/validation";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const createIntegrations = {
  // redirect_uri must match what the frontend's auth-code flow used to get
  // `code` — "postmessage" for the @react-oauth/google popup flow.
  googleCalendarConnection: loggedInProcedure
    .input(
      z.object({
        code: stringNotBlank(),
        redirect_uri: stringNotBlank(),
      })
    )
    .mutation(async (opts) => {
      let tokens;
      try {
        tokens = await exchangeGoogleAuthCode(
          opts.input.code,
          opts.input.redirect_uri
        );
      } catch {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Failed to connect Google Calendar. Please try again.",
        });
      }
      if (!tokens.refresh_token) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Google didn't grant offline access. Reconnect and approve calendar access when prompted.",
        });
      }

      await opts.ctx.prisma.googleCalendarConnection.upsert({
        where: { user_id: opts.ctx.user.id },
        create: {
          user_id: opts.ctx.user.id,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
        update: {
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
          revoked_at: null,
        },
      });

      return {
        code: STATUS_OK,
        message: "Google Calendar connected",
      };
    }),
};
