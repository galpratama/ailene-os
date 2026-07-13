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

export default function SelectTrainerApplicationFormOS({
  applicationId,
  sessionId,
  isOpen,
  onClose,
}: {
  applicationId: number | null;
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [role, setRole] = useState<TrainerAssignmentRoleEnum>("LEAD");
  const [sessionDate, setSessionDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setRole("LEAD");
    setSessionDate("");
    setParticipants("");
    setNotes("");
    setError(null);
    onClose();
  }

  const mutation = trpc.update.b2bClass.selectApplication.useMutation({
    onSuccess: () => {
      utils.list.b2bClass.applications.invalidate({ session_id: sessionId });
      utils.read.b2bClass.session.invalidate({ id: sessionId });
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!applicationId) return;
    mutation.mutate({
      application_id: applicationId,
      role,
      session_date: sessionDate || null,
      participant_count: participants ? Number(participants) : null,
      notes: notes.trim() || null,
    });
  }

  return (
    <SheetOS
      title="Select & Assign Trainer"
      description="Confirms this trainer for the session and creates the assignment."
      isOpen={isOpen && !!applicationId}
      onClose={close}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <AppSelect
            selectId="select-application-role"
            label="Role"
            placeholder="Select role"
            required
            value={role}
            options={roleOptions}
            onChange={(value) =>
              setRole((value as TrainerAssignmentRoleEnum) ?? "LEAD")
            }
          />
          <AppInput
            inputId="select-application-date"
            label="Session Date"
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
          <AppNumberInput
            inputId="select-application-participants"
            label="Participant Count"
            value={participants}
            onValueChange={setParticipants}
          />
          <AppTextArea
            textAreaId="select-application-notes"
            label="Assignment Notes"
            rows={4}
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
            Select & Assign
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
