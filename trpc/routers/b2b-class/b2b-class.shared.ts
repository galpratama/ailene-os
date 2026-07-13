import { STATUS_BAD_REQUEST } from "@/lib/status_code";
import {
  isTrainerJunior,
  MIN_AI_EXPERIENCE_YEARS,
} from "@/trpc/routers/trainer-pool/trainer-pool.shared";
import {
  B2BClassDifficultyEnum,
  Prisma,
  PrismaClient,
  TrainerLevelEnum,
  TrainerLevelOverrideEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function findEligibleTrainersForSession(
  prisma: PrismaLike,
  difficulty: B2BClassDifficultyEnum
) {
  const trainers = await prisma.trainer.findMany({
    where: {
      deleted_at: null,
      status: { in: [TrainerStatusEnum.CERTIFIED, TrainerStatusEnum.ACTIVE] },
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      level: true,
      level_override: true,
    },
  });
  if (difficulty !== B2BClassDifficultyEnum.ADVANCED) return trainers;
  return trainers.filter((trainer) => !isTrainerJunior(trainer));
}

export function assertSessionApplicationEligible(
  trainer: {
    level: TrainerLevelEnum;
    level_override: TrainerLevelOverrideEnum | null;
    status: TrainerStatusEnum;
    ai_experience_years: number;
  },
  session: { difficulty: B2BClassDifficultyEnum }
) {
  if (
    trainer.status !== TrainerStatusEnum.CERTIFIED &&
    trainer.status !== TrainerStatusEnum.ACTIVE
  ) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "Trainer belum berstatus certified/active untuk mengajukan aplikasi.",
    });
  }
  if (trainer.ai_experience_years < MIN_AI_EXPERIENCE_YEARS) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: `Minimal ${MIN_AI_EXPERIENCE_YEARS} tahun pengalaman AI diperlukan.`,
    });
  }
  if (
    session.difficulty === B2BClassDifficultyEnum.ADVANCED &&
    isTrainerJunior(trainer)
  ) {
    throw new TRPCError({
      code: STATUS_BAD_REQUEST,
      message: "Sesi Advanced hanya terbuka untuk trainer level Senior.",
    });
  }
}

export function computeQuorum(session: { min_quorum: number }, appliedCount: number) {
  return {
    min_quorum: session.min_quorum,
    applied_count: appliedCount,
    quorum_met: appliedCount >= session.min_quorum,
  };
}
