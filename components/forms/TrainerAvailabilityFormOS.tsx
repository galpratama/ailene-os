"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import { trpc } from "@/trpc/client";
import type { TrainerAvailabilityStatusEnum } from "@prisma/client";
import { Check } from "lucide-react";
import { FormEvent, useState } from "react";

const availabilityOptions: AppSelectOption[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "LIMITED", label: "Limited" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

export default function TrainerAvailabilityFormOS({
  trainerId,
  availabilities,
}: {
  trainerId: string;
  availabilities: {
    id: number;
    period: Date | string;
    status: TrainerAvailabilityStatusEnum;
    notes: string | null;
  }[];
}) {
  const utils = trpc.useUtils();
  const [period, setPeriod] = useState("");
  const [status, setStatus] =
    useState<TrainerAvailabilityStatusEnum>("AVAILABLE");
  const [notes, setNotes] = useState("");
  const mutation = trpc.update.trainerPool.availability.useMutation({
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      setNotes("");
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!period) return;
    mutation.mutate({
      trainer_id: trainerId,
      period: `${period}-01`,
      status,
      notes: notes.trim() || null,
    });
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">
        Monthly availability
      </h3>
      <form
        onSubmit={submit}
        className="mt-4 grid gap-3 lg:grid-cols-[170px_170px_minmax(0,1fr)_auto] lg:items-end"
      >
        <AppInput
          inputId="availability-month"
          label="Month"
          type="month"
          required
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
        />
        <AppSelect
          selectId="availability-status"
          label="Status"
          placeholder="Select"
          value={status}
          options={availabilityOptions}
          onChange={(value) =>
            setStatus(value as TrainerAvailabilityStatusEnum)
          }
        />
        <AppTextArea
          textAreaId="availability-notes"
          label="Notes"
          rows={1}
          className="min-h-9"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <AppButton type="submit" disabled={mutation.isPending}>
          <Check size={14} />
          Save
        </AppButton>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {availabilities.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-zinc-800"
          >
            <span className="font-bold">
              {new Date(entry.period).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            <span className="ml-2 text-gray-500">
              {entry.status.toLowerCase()}
            </span>
            {entry.notes && (
              <span className="ml-2 text-gray-400">· {entry.notes}</span>
            )}
          </div>
        ))}
        {availabilities.length === 0 && (
          <p className="text-sm text-gray-400">No availability recorded.</p>
        )}
      </div>
    </section>
  );
}
