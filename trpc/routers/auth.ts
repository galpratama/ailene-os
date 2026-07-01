import LogError from "@/lib/prisma-log-error";
import {
  STATUS_BAD_REQUEST,
  STATUS_FORBIDDEN,
  STATUS_NO_CONTENT,
  STATUS_OK,
} from "@/lib/status_code";
import { baseProcedure, createTRPCRouter, loggedInProcedure } from "@/trpc/init";
import { GoogleTokenVerifier } from "@/trpc/utils/google_verifier";
import { stringNotBlank } from "@/trpc/utils/validation";
import { StatusEnum } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  login: baseProcedure
    .input(z.object({ accessToken: stringNotBlank() }))
    .mutation(async (opts) => {
      const userInfo = await GoogleTokenVerifier(opts.input.accessToken);
      if (!userInfo) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "The given credential is not valid.",
        });
      }

      const findUser = await opts.ctx.prisma.user.findUnique({
        where: { email: userInfo.email },
      });
      let registeredUser = findUser;

      if (!findUser) {
        registeredUser = await opts.ctx.prisma.user.create({
          data: {
            full_name: userInfo.name,
            email: userInfo.email,
            avatar: userInfo.picture,
          },
        });
      } else if (findUser.status === StatusEnum.INACTIVE) {
        throw new TRPCError({
          code: STATUS_FORBIDDEN,
          message: "Your account has been inactivated.",
        });
      } else if (findUser.deleted_at !== null) {
        throw new TRPCError({
          code: STATUS_FORBIDDEN,
          message: `Your account has been deleted (${findUser.deleted_at}).`,
        });
      } else {
        // Sync name/avatar from Google if stale
        if (
          findUser.full_name !== userInfo.name ||
          findUser.avatar !== userInfo.picture
        ) {
          registeredUser = await opts.ctx.prisma.user.update({
            where: { email: userInfo.email },
            data: { full_name: userInfo.name, avatar: userInfo.picture },
          });
        }

        // Update last_login
        const updated: number =
          await opts.ctx.prisma.$executeRaw`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = ${userInfo.email}`;
        if (updated > 1) {
          await LogError(
            "auth.login",
            "More-than-one users have last_login updated at once."
          );
        }
      }

      const generatedToken = randomBytes(64).toString("hex");
      const createdToken = await opts.ctx.prisma.token.create({
        data: {
          user_id: registeredUser!.id,
          is_active: true,
          token: generatedToken,
        },
      });

      return {
        code: STATUS_OK,
        message: "Success",
        token: createdToken,
        registered_user: registeredUser,
      };
    }),

  checkSession: loggedInProcedure.query((opts) => {
    const u = opts.ctx.user;
    return {
      code: STATUS_OK,
      message: "Success",
      user: {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        avatar: u.avatar,
        role_id: u.role_id,
        role_name: u.role.name,
        status: u.status,
      },
    };
  }),

  logout: baseProcedure
    .input(z.object({ token: stringNotBlank() }))
    .mutation(async (opts) => {
      const deleted = await opts.ctx.prisma.token.deleteMany({
        where: { token: opts.input.token },
      });
      if (deleted.count > 1) {
        await LogError(
          "auth.logout",
          "More-than-one tokens are removed at once."
        );
      }
      return { code: STATUS_NO_CONTENT, message: "Successfully logged out" };
    }),
});
