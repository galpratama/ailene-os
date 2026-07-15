"use client";

import TrainerScreeningFormOS from "@/components/forms/TrainerScreeningFormOS";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import Link from "next/link";
import { useEffect } from "react";

export default function TrainerScreeningOS({
  sessionToken,
  trainerId,
}: {
  sessionToken: string;
  trainerId: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } =
    trpc.read.trainerPool.trainer.useQuery(
      { id: trainerId },
      { enabled: !!sessionToken }
    );
  const trainer = data?.trainer;

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading trainer...
      </p>
    );
  }
  if (isError || !trainer) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Trainer not found or you do not have access.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <Link
          href={`/trainers/${trainerId}`}
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← {trainer.full_name}
        </Link>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          Screening
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <TrainerStageLabel stage={trainer.stage} />
          <TrainerLevelLabel level={trainer.level} />
        </div>
      </div>

      <TrainerScreeningFormOS
        trainerId={trainerId}
        steps={trainer.screening_steps}
        score={trainer}
      />
    </div>
  );
}
