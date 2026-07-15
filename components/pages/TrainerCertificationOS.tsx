"use client";

import AppButton from "@/components/buttons/AppButton";
import TrainerCertificationFormOS from "@/components/forms/TrainerCertificationFormOS";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TrainerCertificationOS({
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
          Certification
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <TrainerStageLabel stage={trainer.stage} />
          <TrainerLevelLabel level={trainer.level} />
        </div>
      </div>

      <TrainerCertificationFormOS
        trainerId={trainerId}
        steps={trainer.certification_steps}
      />
    </div>
  );
}
