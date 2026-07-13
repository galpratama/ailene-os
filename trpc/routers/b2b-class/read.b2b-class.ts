import { STATUS_OK } from "@/lib/status_code";
import { administratorProcedure, baseProcedure } from "@/trpc/init";
import { readFailedNotFound } from "@/trpc/utils/errors";
import { objectHasOnlyID } from "@/trpc/utils/validation";
import { B2BClassSessionStatusEnum } from "@prisma/client";
import { computeQuorum } from "./b2b-class.shared";

export const readB2BClass = {
  class: administratorProcedure
    .input(objectHasOnlyID())
    .query(async ({ ctx, input }) => {
      const theClass = await ctx.prisma.b2BClass.findFirst({
        where: { id: input.id },
        include: {
          pipeline: { select: { id: true, name: true } },
          creator: { select: { id: true, full_name: true } },
          sessions: {
            include: { _count: { select: { applications: true } } },
            orderBy: [{ created_at: "desc" }],
          },
        },
      });
      if (!theClass) throw readFailedNotFound("class");

      return {
        code: STATUS_OK,
        message: "Success",
        class: {
          id: theClass.id,
          name: theClass.name,
          description: theClass.description,
          pipeline_id: theClass.pipeline?.id ?? null,
          pipeline_name: theClass.pipeline?.name ?? null,
          created_by_name: theClass.creator?.full_name ?? null,
          created_at: theClass.created_at,
          sessions: theClass.sessions.map((session) => ({
            id: session.id,
            name: session.name,
            difficulty: session.difficulty,
            status: session.status,
            session_date: session.session_date,
            ...computeQuorum(session, session._count.applications),
          })),
        },
      };
    }),

  session: administratorProcedure
    .input(objectHasOnlyID())
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.b2BClassSession.findFirst({
        where: { id: input.id },
        include: {
          class: {
            select: { id: true, name: true, pipeline_id: true },
          },
          _count: { select: { applications: true } },
          notifications: { select: { status: true } },
        },
      });
      if (!session) throw readFailedNotFound("session");

      return {
        code: STATUS_OK,
        message: "Success",
        session: {
          id: session.id,
          name: session.name,
          difficulty: session.difficulty,
          status: session.status,
          session_date: session.session_date,
          opened_at: session.opened_at,
          closed_at: session.closed_at,
          class_id: session.class.id,
          class_name: session.class.name,
          pipeline_id: session.class.pipeline_id,
          ...computeQuorum(session, session._count.applications),
          notifications_sent: session.notifications.filter(
            (entry) => entry.status === "SENT"
          ).length,
          notifications_failed: session.notifications.filter(
            (entry) => entry.status === "FAILED"
          ).length,
        },
      };
    }),

  sessionPublic: baseProcedure
    .input(objectHasOnlyID())
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.b2BClassSession.findFirst({
        where: { id: input.id, status: B2BClassSessionStatusEnum.OPEN },
        include: { class: { select: { name: true } } },
      });
      if (!session) throw readFailedNotFound("session");

      return {
        code: STATUS_OK,
        message: "Success",
        session: {
          id: session.id,
          name: session.name,
          class_name: session.class.name,
          difficulty: session.difficulty,
          session_date: session.session_date,
        },
      };
    }),
};
