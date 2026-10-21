"use client";

import type { PipelinePhase, PipelineStageEntry } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import Label from "@/components/labels/Label";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { DragEvent, useState } from "react";

function reorderedCodes(
  stages: PipelineStageEntry[],
  source: string,
  target: string,
  after: boolean,
) {
  const codes = stages.map((stage) => stage.code).filter((code) => code !== source);
  const targetIndex = codes.indexOf(target);
  if (targetIndex < 0) return stages.map((stage) => stage.code);
  codes.splice(targetIndex + Number(after), 0, source);
  return codes;
}

export default function PipelineStageListOS({
  phase,
  stages,
  isReordering,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: {
  phase: PipelinePhase;
  stages: PipelineStageEntry[];
  isReordering: boolean;
  onAdd: (phase: PipelinePhase) => void;
  onEdit: (stage: PipelineStageEntry) => void;
  onDelete: (stage: PipelineStageEntry) => void;
  onReorder: (phase: PipelinePhase, codes: string[]) => void;
}) {
  const [draggedCode, setDraggedCode] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ code: string; after: boolean } | null>(null);

  function moveByButton(index: number, direction: -1 | 1) {
    const codes = stages.map((stage) => stage.code);
    const other = index + direction;
    if (other < 0 || other >= codes.length) return;
    [codes[index], codes[other]] = [codes[other], codes[index]];
    onReorder(phase, codes);
  }

  function dragOver(event: DragEvent<HTMLDivElement>, code: string) {
    if (!draggedCode || draggedCode === code || isReordering) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    setDropTarget({ code, after: event.clientY > rect.top + rect.height / 2 });
  }

  function drop(event: DragEvent<HTMLDivElement>, code: string) {
    event.preventDefault();
    if (draggedCode && draggedCode !== code && !isReordering) {
      const rect = event.currentTarget.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      const codes = reorderedCodes(stages, draggedCode, code, after);
      if (codes.some((entry, index) => entry !== stages[index]?.code)) onReorder(phase, codes);
    }
    setDraggedCode(null);
    setDropTarget(null);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">{phase.toUpperCase()} stages</h3>
            <Label variant="gray">{stages.length}</Label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {phase === "sdr" ? "Qualify leads before the deal phase." : "Progress deals through to an outcome."}
          </p>
        </div>
        <AppButton type="button" variant="outline" size="sm" onClick={() => onAdd(phase)} disabled={isReordering}>
          <Plus size={14} /> Add stage
        </AppButton>
      </div>

      <div className="divide-y divide-line-soft">
        {stages.map((stage, index) => (
          <div
            key={stage.code}
            onDragOver={(event) => dragOver(event, stage.code)}
            onDrop={(event) => drop(event, stage.code)}
            className={`relative flex items-center gap-3 px-4 py-3 transition-colors ${
              draggedCode === stage.code ? "opacity-50" : ""
            } ${dropTarget?.code === stage.code ? "bg-claude/5" : ""}`}
          >
            {dropTarget?.code === stage.code && (
              <span className={`absolute inset-x-0 h-0.5 bg-claude ${dropTarget.after ? "bottom-0" : "top-0"}`} />
            )}
            <div
              draggable={!isReordering}
              onDragStart={(event) => {
                setDraggedCode(stage.code);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", stage.code);
              }}
              onDragEnd={() => {
                setDraggedCode(null);
                setDropTarget(null);
              }}
              title="Drag to reorder"
              className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-gray-400 active:cursor-grabbing dark:text-zinc-500"
            >
              <GripVertical size={17} />
            </div>
            <span className="w-5 shrink-0 text-right text-xs tabular-nums text-gray-400 dark:text-zinc-500">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{stage.name}</p>
                {stage.terminal && <Label variant="oranye">Terminal</Label>}
                {stage.system && <Label variant="gray">Built-in</Label>}
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                {stage.code} · {stage.pipeline_count} {stage.pipeline_count === 1 ? "pipeline" : "pipelines"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <AppButton type="button" variant="secondary" size="iconSm" aria-label={`Move ${stage.name} up`} title="Move up" disabled={isReordering || index === 0} onClick={() => moveByButton(index, -1)}><ArrowUp size={14} /></AppButton>
              <AppButton type="button" variant="secondary" size="iconSm" aria-label={`Move ${stage.name} down`} title="Move down" disabled={isReordering || index === stages.length - 1} onClick={() => moveByButton(index, 1)}><ArrowDown size={14} /></AppButton>
              <AppButton type="button" variant="secondary" size="iconSm" aria-label={`Edit ${stage.name}`} title="Edit stage" disabled={isReordering} onClick={() => onEdit(stage)}><Pencil size={14} /></AppButton>
              <AppButton type="button" variant="dangerGhost" size="iconSm" aria-label={`Delete ${stage.name}`} title={stage.system ? "Built-in stages cannot be deleted" : "Delete stage"} disabled={isReordering || stage.system} onClick={() => onDelete(stage)}><Trash2 size={14} /></AppButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
