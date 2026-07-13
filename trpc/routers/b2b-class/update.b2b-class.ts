import {
  buildSessionInviteApplyUrl,
  buildSessionInviteEmailHtml,
} from "@/lib/email-templates/session-invite-email";
import { sendEmail } from "@/lib/mailtrap";
import LogError from "@/lib/prisma-log-error";
import { STATUS_BAD_REQUEST, STATUS_OK } from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import { assertTrainerAssignable } from "@/trpc/routers/trainer-pool/trainer-pool.shared";
import { checkUpdateResult, readFailedNotFound } from "@/trpc/utils/errors";
import {
  numberIsID,
  numberIsPosInt,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BClassDifficultyEnum,
  B2BClassSessionStatusEnum,
  PrismaClient,
  TrainerApplicationStatusEnum,
  TrainerAssignmentRoleEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { findEligibleTrainersForSession } from "./b2b-class.shared";

const optionalText = stringNotBlank().nullable().optional();

async function notifyEligibleTrainers(
  prisma: PrismaClient,
  session: {
    id: number;
    name: string;
    difficulty: B2BClassDifficultyEnum;
    class: { name: string };
  }
) {
  const eligibleTrainers = await findEligibleTrainersForSession(
    prisma,
    session.difficulty
  );
  const applyUrl = buildSessionInviteApplyUrl(session.id);

  const results = await Promise.allSettled(
    eligibleTrainers.map((trainer) =>
      sendEmail({
        mailRecipients: [trainer.email],
        mailSubject: `Sesi baru terbuka: ${session.class.name} · ${session.name}`,
        mailHtml: buildSessionInviteEmailHtml({
          trainerName: trainer.full_name,
          className: session.class.name,
          sessionName: session.name,
          difficulty: session.difficulty,
          applyUrl,
        }),
      })
    )
  );

  await prisma.trainerSessionNotification.createMany({
    data: eligibleTrainers.map((trainer, index) => ({
      session_id: session.id,
      trainer_id: trainer.id,
      email: trainer.email,
      status: results[index].status === "fulfilled" ? "SENT" : "FAILED",
      error_message:
        results[index].status === "rejected"
          ? String((results[index] as PromiseRejectedResult).reason)
          : null,
      sent_at: results[index].status === "fulfilled" ? new Date() : null,
    })),
    skipDuplicates: true,
  });

  const failedCount = results.filter((r) => r.status === "rejected").length;
  if (failedCount > 0) {
    await LogError(
      "b2bClass.sessionOpen",
      `${failedCount}/${eligibleTrainers.length} session invite emails failed to send.`
    );
  }
}

export const updateB2BClass = {
  class: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        pipeline_id: numberIsID().nullable().optional(),
        description: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updated = await ctx.prisma.b2BClass.updateMany({
        where: { id },
        data,
      });
      await checkUpdateResult(updated.count, "class", "classes");
      return { code: STATUS_OK, message: "Class updated" };
    }),

  session: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        name: stringNotBlank().optional(),
        difficulty: z.enum(B2BClassDifficultyEnum).optional(),
        min_quorum: z.int().min(1).max(50).optional(),
        session_date: z.iso.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, session_date, ...rest } = input;
      const existing = await ctx.prisma.b2BClassSession.findFirst({
        where: { id },
      });
      if (!existing) throw readFailedNotFound("session");
      if (
        existing.status !== B2BClassSessionStatusEnum.DRAFT &&
        (rest.difficulty !== undefined || rest.min_quorum !== undefined)
      ) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Difficulty and quorum can only be edited while the session is still a draft.",
        });
      }

      const updated = await ctx.prisma.b2BClassSession.updateMany({
        where: { id },
        data: {
          ...rest,
          session_date:
            session_date !== undefined
              ? session_date
                ? new Date(session_date)
                : null
              : undefined,
        },
      });
      await checkUpdateResult(updated.count, "session", "sessions");
      return { code: STATUS_OK, message: "Session updated" };
    }),

  sessionOpen: administratorProcedure
    .input(z.object({ id: numberIsID() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.b2BClassSession.updateMany({
        where: { id: input.id, status: B2BClassSessionStatusEnum.DRAFT },
        data: {
          status: B2BClassSessionStatusEnum.OPEN,
          opened_at: new Date(),
        },
      });
      if (session.count < 1) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Session is not in draft status, or does not exist.",
        });
      }

      const openedSession = await ctx.prisma.b2BClassSession.findFirstOrThrow({
        where: { id: input.id },
        include: { class: { select: { name: true } } },
      });

      try {
        await notifyEligibleTrainers(ctx.prisma, openedSession);
      } catch (error) {
        await LogError(
          "b2bClass.sessionOpen",
          "Failed to fan out session invite emails",
          error
        );
      }

      return { code: STATUS_OK, message: "Session opened" };
    }),

  sessionClose: administratorProcedure
    .input(z.object({ id: numberIsID() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.b2BClassSession.updateMany({
        where: { id: input.id, status: B2BClassSessionStatusEnum.OPEN },
        data: { status: B2BClassSessionStatusEnum.CLOSED, closed_at: new Date() },
      });
      if (updated.count < 1) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Session is not open, or does not exist.",
        });
      }
      return { code: STATUS_OK, message: "Session closed" };
    }),

  applicationStatus: administratorProcedure
    .input(
      z.object({
        id: numberIsID(),
        status: z.enum([
          TrainerApplicationStatusEnum.SHORTLISTED,
          TrainerApplicationStatusEnum.REJECTED,
        ]),
        notes: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.trainerApplication.updateMany({
        where: { id: input.id },
        data: {
          status: input.status,
          notes: input.notes,
          reviewed_by: ctx.user.id,
          reviewed_at: new Date(),
        },
      });
      await checkUpdateResult(updated.count, "application", "applications");
      return { code: STATUS_OK, message: "Application updated" };
    }),

  selectApplication: administratorProcedure
    .input(
      z.object({
        application_id: numberIsID(),
        pipeline_id: numberIsID().nullable().optional(),
        role: z.enum(TrainerAssignmentRoleEnum).optional(),
        session_date: z.iso.date().nullable().optional(),
        participant_count: numberIsPosInt().max(500).nullable().optional(),
        notes: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.trainerApplication.findFirst({
        where: { id: input.application_id },
        include: {
          trainer: true,
          session: { include: { class: true } },
        },
      });
      if (!application) throw readFailedNotFound("application");

      assertTrainerAssignable(application.trainer, input.role);

      const pipelineId = input.pipeline_id ?? application.session.class.pipeline_id;
      if (!pipelineId) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "This class has no linked B2B project. Provide pipeline_id explicitly.",
        });
      }

      const created = await ctx.prisma.$transaction(async (tx) => {
        await tx.trainerApplication.update({
          where: { id: application.id },
          data: {
            status: TrainerApplicationStatusEnum.SELECTED,
            reviewed_by: ctx.user.id,
            reviewed_at: new Date(),
          },
        });
        return tx.trainerAssignment.create({
          data: {
            pipeline_id: pipelineId,
            trainer_id: application.trainer_id,
            session_id: application.session_id,
            role: input.role,
            session_date: input.session_date
              ? new Date(input.session_date)
              : null,
            participant_count: input.participant_count ?? null,
            notes: input.notes ?? null,
          },
        });
      });

      return {
        code: STATUS_OK,
        message: "Trainer selected and assigned",
        assignment_id: created.id,
      };
    }),
};
