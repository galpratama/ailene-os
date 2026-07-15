"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import type { TrainerAssignmentRoleEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const roleOptions: AppSelectOption[] = [
  { value: "LEAD", label: "Lead trainer" },
  { value: "ASSISTANT", label: "Assistant trainer" },
  { value: "CO_TRAINER", label: "Co-trainer" },
  { value: "SPECIALIST", label: "Specialist" },
];

export default function CreateTrainerAssignmentFormOS({
  isOpen,
  onClose,
  trainerId,
  pipelineId,
}: {
  isOpen: boolean;
  onClose: () => void;
  trainerId?: string;
  pipelineId?: number;
}) {
  const utils = trpc.useUtils();
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    null
  );
  const [role, setRole] = useState<TrainerAssignmentRoleEnum>("LEAD");
  const [sessionDate, setSessionDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: trainerData } = trpc.list.trainerPool.trainers.useQuery(
    { page: 1, page_size: 200 },
    { enabled: isOpen && !trainerId }
  );
  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: isOpen && !pipelineId }
  );
  const trainerOptions: AppSelectOption[] =
    trainerData?.list
      .filter((trainer) => trainer.stage === "ELIGIBLE")
      .map((trainer) => ({
        value: trainer.id,
        label: `${trainer.full_name} · ${trainer.level.toLowerCase()}`,
      })) ?? [];
  const pipelineOptions: AppSelectOption[] =
    pipelineData?.list.map((pipeline) => ({
      value: pipeline.id,
      label: `${pipeline.company_name} · ${pipeline.name}`,
    })) ?? [];

  function close() {
    setSelectedTrainerId("");
    setSelectedPipelineId(null);
    setRole("LEAD");
    setSessionDate("");
    setParticipants("");
    setNotes("");
    setError(null);
    onClose();
  }

  const mutation = trpc.create.trainerPool.assignment.useMutation({
    onSuccess: () => {
      utils.list.trainerPool.assignments.invalidate();
      utils.list.trainerPool.trainers.invalidate();
      if (trainerId) {
        utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      }
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const finalTrainerId = trainerId ?? selectedTrainerId;
    const finalPipelineId = pipelineId ?? selectedPipelineId;
    if (!finalTrainerId || !finalPipelineId) {
      return setError("Trainer and project are required.");
    }
    mutation.mutate({
      trainer_id: finalTrainerId,
      pipeline_id: finalPipelineId,
      role,
      session_date: sessionDate || null,
      participant_count: participants ? Number(participants) : null,
      notes: notes.trim() || null,
    });
  }

  return (
    <SheetOS
      title="Assign Trainer"
      description="Connect a certified trainer with a B2B project."
      isOpen={isOpen}
      onClose={close}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          {!trainerId && (
            <AppSelect
              selectId="assignment-trainer"
              label="Trainer"
              required
              placeholder="Select a certified trainer"
              value={selectedTrainerId}
              options={trainerOptions}
              onChange={(value) =>
                setSelectedTrainerId((value as string) ?? "")
              }
            />
          )}
          {!pipelineId && (
            <AppSelect
              selectId="assignment-pipeline"
              label="Client Project"
              required
              placeholder="Select a project"
              value={selectedPipelineId}
              options={pipelineOptions}
              onChange={(value) =>
                setSelectedPipelineId(value as number | null)
              }
            />
          )}
          <AppSelect
            selectId="assignment-role"
            label="Role"
            required
            placeholder="Select role"
            value={role}
            options={roleOptions}
            onChange={(value) =>
              setRole(value as TrainerAssignmentRoleEnum)
            }
          />
          <AppInput
            inputId="assignment-date"
            label="Session Date"
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
          <AppNumberInput
            inputId="assignment-participants"
            label="Participant Count"
            value={participants}
            onValueChange={setParticipants}
          />
          <AppTextArea
            textAreaId="assignment-notes"
            label="Assignment Notes"
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={close}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            className="flex-1 justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Assign
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
