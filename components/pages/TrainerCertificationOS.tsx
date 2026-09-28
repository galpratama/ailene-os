"use client";

import AppButton from "@/components/buttons/AppButton";
import TrainerCertificationFormOS from "@/components/forms/TrainerCertificationFormOS";
import { getTrainerDetails } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrainerCertificationOS({
  sessionToken,
  trainerId,
}: {
  sessionToken: string;
  trainerId: string;
}) {
  const router = useRouter();
  const { data: trainer, isLoading, isError } = useQuery({
    queryKey: ["trainers", "details", trainerId],
    queryFn: async () => requireApiData(await getTrainerDetails(trainerId)),
    enabled: !!sessionToken,
  });

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
        <p className="mt-1 text-sm text-gray-500">
          Pantau dan nilai jalur sertifikasi kandidat menuju pool trainer
          bersertifikat.
        </p>
      </div>

      <TrainerCertificationFormOS
        trainerId={trainerId}
        trainer={{
          full_name: trainer.full_name,
          avatar: trainer.avatar,
          ai_experience_years: trainer.ai_experience_years,
          stage: trainer.stage,
          level: trainer.level,
        }}
        steps={trainer.certification_steps}
      />
    </div>
  );
}
