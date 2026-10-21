"use client";

import type { PipelinePhase, PipelineStageEntry } from "@/apis/sales";
import DeletePipelineStageFormOS from "@/components/forms/DeletePipelineStageFormOS";
import PipelineStageFormOS from "@/components/forms/PipelineStageFormOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import PipelineStageListOS from "@/components/static-sections/PipelineStageListOS";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { reorderPipelineStages } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

type FormTarget =
  | { mode: "create"; phase: PipelinePhase }
  | { mode: "edit"; stage: PipelineStageEntry };

const CATALOG_KEY = ["sales", "pipeline-stages"];

export default function PipelineStagesPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const queryClient = useQueryClient();
  const catalog = usePipelineStages(!!sessionToken);
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PipelineStageEntry | null>(
    null
  );

  async function refreshStages() {
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  const reorder = useMutation({
    mutationFn: async (payload: { phase: PipelinePhase; codes: string[] }) =>
      requireApiData(await reorderPipelineStages(payload)),
    onMutate: async ({ phase, codes }) => {
      await queryClient.cancelQueries({ queryKey: CATALOG_KEY });
      const previous =
        queryClient.getQueryData<PipelineStageEntry[]>(CATALOG_KEY);
      queryClient.setQueryData<PipelineStageEntry[]>(CATALOG_KEY, (current) => {
        if (!current) return current;
        const byCode = new Map(current.map((stage) => [stage.code, stage]));
        const ordered = codes.map((code) => byCode.get(code));
        if (ordered.some((stage) => !stage)) return current;
        const sortedPhase = ordered.map((stage, index) => ({
          ...stage!,
          sort_order: (index + 1) * 10,
        }));
        return phase === "sdr"
          ? [
              ...sortedPhase,
              ...current.filter((stage) => stage.phase === "bdr"),
            ]
          : [
              ...current.filter((stage) => stage.phase === "sdr"),
              ...sortedPhase,
            ];
      });
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous)
        queryClient.setQueryData(CATALOG_KEY, context.previous);
      showErrorToast(error);
    },
    onSettled: refreshStages,
  });

  const stages = catalog.stages;
  const sdrStages = stages.filter((stage) => stage.phase === "sdr");
  const bdrStages = stages.filter((stage) => stage.phase === "bdr");

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Pipeline stages"
        description="Manage the steps that leads follow from qualification to a closed deal."
        action={{
          label: "Add stage",
          icon: Plus,
          onClick: () => setFormTarget({ mode: "create", phase: "sdr" }),
        }}
      />

      {catalog.isLoading && (
        <div className="flex items-center gap-2 py-10 text-sm text-gray-500 dark:text-zinc-400">
          <Loader2 size={16} className="animate-spin" /> Loading pipeline
          stages...
        </div>
      )}
      {catalog.isError && (
        <div className="rounded-xl border border-line bg-card-bg p-5 text-sm text-merah">
          {catalog.error.message}
        </div>
      )}
      {catalog.isSuccess && (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <PipelineStageListOS
            phase="sdr"
            stages={sdrStages}
            isReordering={reorder.isPending}
            onAdd={(phase) => setFormTarget({ mode: "create", phase })}
            onEdit={(stage) => setFormTarget({ mode: "edit", stage })}
            onDelete={setDeleteTarget}
            onReorder={(phase, codes) => reorder.mutate({ phase, codes })}
          />
          <PipelineStageListOS
            phase="bdr"
            stages={bdrStages}
            isReordering={reorder.isPending}
            onAdd={(phase) => setFormTarget({ mode: "create", phase })}
            onEdit={(stage) => setFormTarget({ mode: "edit", stage })}
            onDelete={setDeleteTarget}
            onReorder={(phase, codes) => reorder.mutate({ phase, codes })}
          />
        </div>
      )}

      {formTarget && (
        <PipelineStageFormOS
          key={
            formTarget.mode === "edit"
              ? formTarget.stage.code
              : `new-${formTarget.phase}`
          }
          stage={formTarget.mode === "edit" ? formTarget.stage : undefined}
          initialPhase={
            formTarget.mode === "create"
              ? formTarget.phase
              : formTarget.stage.phase
          }
          onClose={() => setFormTarget(null)}
          onSaved={refreshStages}
        />
      )}
      {deleteTarget && (
        <DeletePipelineStageFormOS
          key={deleteTarget.code}
          stage={deleteTarget}
          stages={stages}
          onClose={() => setDeleteTarget(null)}
          onDeleted={refreshStages}
        />
      )}
    </div>
  );
}
