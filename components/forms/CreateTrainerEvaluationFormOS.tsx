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
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function CreateTrainerEvaluationFormOS({
  trainerId,
  isOpen,
  onClose,
}: {
  trainerId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [rating, setRating] = useState("");
  const [evaluationDate, setEvaluationDate] = useState("");
  const [selfReport, setSelfReport] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data } = trpc.list.trainerPool.assignments.useQuery(
    { trainer_id: trainerId, page: 1, page_size: 200 },
    { enabled: isOpen }
  );
  const assignmentOptions: AppSelectOption[] =
    data?.list.map((entry) => ({
      value: entry.id,
      label: `${entry.company_name} · ${entry.pipeline_name}${
        entry.session_date
          ? ` · ${new Date(entry.session_date).toLocaleDateString("en-GB")}`
          : ""
      }`,
    })) ?? [];

  function close() {
    setAssignmentId(null);
    setRating("");
    setEvaluationDate("");
    setSelfReport(false);
    setNotes("");
    setError(null);
    onClose();
  }

  const mutation = trpc.create.trainerPool.evaluation.useMutation({
    onSuccess: () => {
      utils.list.trainerPool.evaluations.invalidate();
      utils.list.trainerPool.trainers.invalidate();
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!rating) return setError("Participant rating is required.");
    mutation.mutate({
      trainer_id: trainerId,
      assignment_id: assignmentId,
      participant_rating_avg: Number(rating),
      self_report_submitted: selfReport,
      evaluation_date: evaluationDate || null,
      review_notes: notes.trim() || null,
    });
  }

  return (
    <SheetOS
      title="Add Evaluation"
      description="Record delivery feedback and update the trainer QC signal."
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
          <AppSelect
            selectId="evaluation-assignment"
            label="Assignment"
            placeholder="Select assignment"
            value={assignmentId}
            options={assignmentOptions}
            onChange={(value) => setAssignmentId(value as number | null)}
          />
          <AppNumberInput
            inputId="evaluation-rating"
            label="Participant Rating · 0–5"
            required
            mode="decimal"
            value={rating}
            onValueChange={setRating}
          />
          <AppInput
            inputId="evaluation-date"
            label="Evaluation Date"
            type="date"
            value={evaluationDate}
            onChange={(event) => setEvaluationDate(event.target.value)}
          />
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-zinc-700">
            <input
              type="checkbox"
              className="accent-claude"
              checked={selfReport}
              onChange={(event) => setSelfReport(event.target.checked)}
            />
            Trainer self-report submitted
          </label>
          <AppTextArea
            textAreaId="evaluation-notes"
            label="Lead Trainer Review"
            rows={6}
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
            Save Evaluation
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
