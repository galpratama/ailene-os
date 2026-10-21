"use client";

import type { PipelineStageEntry } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppSelect from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { deletePipelineStage } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function DeletePipelineStageFormOS({
  stage,
  stages,
  onClose,
  onDeleted,
}: {
  stage: PipelineStageEntry;
  stages: PipelineStageEntry[];
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [transferTo, setTransferTo] = useState("");
  const [transferError, setTransferError] = useState("");
  const options = stages
    .filter((entry) => entry.code !== stage.code)
    .sort((a, b) => Number(b.phase === stage.phase) - Number(a.phase === stage.phase))
    .map((entry) => ({
      value: entry.code,
      label: `${entry.phase.toUpperCase()} · ${entry.name}`,
    }));

  const remove = useMutation({
    mutationFn: async () =>
      requireApiData(await deletePipelineStage({ code: stage.code, transfer_to: transferTo })),
    onSuccess: async () => {
      await onDeleted();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transferTo) {
      setTransferError("Choose the stage that will receive its pipelines and history.");
      return;
    }
    remove.mutate();
  }

  return (
    <SheetOS
      title={`Delete ${stage.name}?`}
      description="Choose where its pipelines and stage history should move before deleting it."
      isOpen
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-line bg-card-bg p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{stage.name}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{stage.code} · {stage.phase.toUpperCase()}</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-zinc-300">
              {stage.pipeline_count} {stage.pipeline_count === 1 ? "pipeline is" : "pipelines are"} currently in this stage.
            </p>
          </div>
          <div className="space-y-1.5">
            <AppSelect
              selectId="pipeline-stage-transfer"
              label="Move to"
              placeholder="Choose a destination stage"
              value={transferTo}
              options={options}
              onChange={(value) => {
                setTransferTo(typeof value === "string" ? value : "");
                setTransferError("");
              }}
              required
            />
            {transferError && <p className="text-xs text-merah">{transferError}</p>}
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Moving to another phase also changes those pipelines to that phase. Stage history references will be updated. Triaging accepts inbound leads only; Attempting accepts outbound leads only.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <AppButton type="button" variant="outline" size="sm" onClick={onClose} disabled={remove.isPending}>Cancel</AppButton>
          <AppButton type="submit" variant="destructive" size="sm" disabled={remove.isPending || options.length === 0}>
            {remove.isPending && <Loader2 size={14} className="animate-spin" />}
            Delete stage
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
