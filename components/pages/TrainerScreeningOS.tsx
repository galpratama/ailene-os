"use client";

import AppButton from "@/components/buttons/AppButton";
import TrainerScreeningFormOS from "@/components/forms/TrainerScreeningFormOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
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
        <AppButton
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => router.push(`/trainers/${trainerId}`)}
        >
          <ChevronLeft size={14} />
          Trainer Profile
        </AppButton>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          Screening Trainer
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Review candidate progress and score their screening rubric.
        </p>
      </div>

      <TrainerScreeningFormOS
        trainerId={trainerId}
        trainer={{
          full_name: trainer.full_name,
          avatar: trainer.user.avatar,
          ai_experience_years: trainer.ai_experience_years,
          stage: trainer.stage,
          level: trainer.level,
        }}
        steps={trainer.screening_steps}
        score={trainer}
      />
    </div>
  );
}
