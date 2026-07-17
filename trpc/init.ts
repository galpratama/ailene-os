import { SESSION_COOKIE_NAME } from "@/lib/constants";
import GetPrismaClient from "@/lib/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { cookies, headers } from "next/headers";

export type createTRPCContextOptions = {
  sessionToken?: string;
};

export async function createTRPCContext(opts?: createTRPCContextOptions) {
  const prisma = GetPrismaClient();

  async function getSessionTokenFromRequest() {
    const heads = await headers();
    const authHeader = heads.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Login happens on a different subdomain (biz), so the token usually
    // isn't in memory on the current page — fall back to the shared cookie.
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  async function getUserFromSessionToken(sessionToken: string) {
    const tokenObj = await prisma.token.findUnique({
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
      where: {
        token: sessionToken,
      },
    });
    if (!tokenObj) {
      return null;
    }
    return tokenObj.user;
  }

  const sessionToken =
    opts?.sessionToken || (await getSessionTokenFromRequest());
  let user;
  if (sessionToken !== null) {
    user = await getUserFromSessionToken(sessionToken);
  }

  return { prisma, user };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const loggedInProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      prisma: ctx.prisma,
      user: ctx.user, // not-null
    },
  });
});

export const superAdminProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user.role.name !== "Super Admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      prisma: ctx.prisma,
      user: ctx.user, // not-null
    },
  });
});

export const administratorProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (
    ctx.user.role.name !== "Administrator" &&
    ctx.user.role.name !== "Super Admin" &&
    ctx.user.role.name !== "Business Development"
  ) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      prisma: ctx.prisma,
      user: ctx.user, // not-null
    },
  });
});

export const roleBasedProcedure = (roleList: string[]) => {
  return t.procedure.use(async (opts) => {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (!roleList.includes(ctx.user.role.name)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return opts.next({
      ctx: {
        prisma: ctx.prisma,
        user: ctx.user, // not-null
      },
    });
  });
};
