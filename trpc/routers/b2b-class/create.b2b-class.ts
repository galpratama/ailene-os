import { STATUS_BAD_REQUEST, STATUS_CREATED } from "@/lib/status_code";
import { administratorProcedure, baseProcedure } from "@/trpc/init";
import {
  numberIsID,
  stringNotBlank,
} from "@/trpc/utils/validation";
import {
  B2BClassDifficultyEnum,
  B2BClassSessionStatusEnum,
  Prisma,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { assertSessionApplicationEligible } from "./b2b-class.shared";

const optionalText = stringNotBlank().nullable().optional();

export const createB2BClass = {
  class: administratorProcedure
    .input(
      z.object({
        name: stringNotBlank(),
        pipeline_id: numberIsID().nullable().optional(),
        description: optionalText,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.b2BClass.create({
        data: {
          name: input.name,
          pipeline_id: input.pipeline_id ?? null,
          description: input.description ?? null,
          created_by: ctx.user.id,
        },
      });
      return { code: STATUS_CREATED, message: "Class created", id: created.id };
    }),

  session: administratorProcedure
    .input(
      z.object({
        class_id: numberIsID(),
        name: stringNotBlank(),
        difficulty: z.enum(B2BClassDifficultyEnum).optional(),
        min_quorum: z.int().min(1).max(50).optional(),
        session_date: z.iso.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.prisma.b2BClassSession.create({
        data: {
          class_id: input.class_id,
          name: input.name,
          difficulty: input.difficulty,
          min_quorum: input.min_quorum,
          session_date: input.session_date ? new Date(input.session_date) : null,
        },
      });
      return {
        code: STATUS_CREATED,
        message: "Session created",
        id: created.id,
      };
    }),

  publicApply: baseProcedure
    .input(
      z.object({
        session_id: numberIsID(),
        email: z.email(),
        notes: optionalText,
        website: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.website) {
        return {
          code: STATUS_CREATED,
          message: "Application received",
          id: null,
        };
      }

      const session = await ctx.prisma.b2BClassSession.findFirst({
        where: { id: input.session_id, status: B2BClassSessionStatusEnum.OPEN },
      });
      if (!session) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "This session is not open for applications.",
        });
      }

      const trainer = await ctx.prisma.trainer.findFirst({
        where: { email: input.email.toLowerCase(), deleted_at: null },
      });
      if (!trainer) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message:
            "Email tidak ditemukan di trainer pool. Pastikan kamu sudah terdaftar sebagai trainer.",
        });
      }
      assertSessionApplicationEligible(trainer, session);

      try {
        const created = await ctx.prisma.trainerApplication.create({
          data: {
            session_id: session.id,
            trainer_id: trainer.id,
            notes: input.notes ?? null,
          },
        });
        return {
          code: STATUS_CREATED,
          message: "Application received",
          id: created.id,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: STATUS_BAD_REQUEST,
            message: "Kamu sudah pernah mendaftar untuk sesi ini.",
          });
        }
        throw error;
      }
    }),
};
