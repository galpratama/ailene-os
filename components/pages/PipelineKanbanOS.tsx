"use client";

import AppButton from "@/components/buttons/AppButton";
import CreateActionFormOS from "@/components/forms/CreateActionFormOS";
import PriorityLabel from "@/components/labels/PriorityLabel";
import { useHeaderAction } from "@/contexts/HeaderActionContext";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BActionStatusEnum } from "@prisma/client";
import { CalendarClock, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const columns: { value: B2BActionStatusEnum; label: string; dot: string }[] = [
  { value: "TO_DO", label: "To Do", dot: "bg-gray-400" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-biru" },
  { value: "REVIEW", label: "Review", dot: "bg-kuning" },
  { value: "DONE", label: "Done", dot: "bg-hijau" },
];

function initialsOf(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function dueLabel(due: string | Date | null, isDone: boolean) {
  if (!due) return null;
  const target = new Date(due);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0 && !isDone) return { text: `${Math.abs(diffDays)}d late`, late: true };
  if (diffDays === 0 && !isDone) return { text: "Today", late: false };
  return { text: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }), late: false };
}

export default function PipelineKanbanOS({
  sessionToken,
  pipelineId,
}: {
  sessionToken: string;
  pipelineId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [createStatus, setCreateStatus] = useState<B2BActionStatusEnum | null>(null);
  useHeaderAction({
    label: "Add Action",
    icon: Plus,
    onClick: () => setCreateStatus("TO_DO"),
  });

  const utils = trpc.useUtils();

  const { data: pipelineData } = trpc.read.b2b.pipeline.useQuery(
    { id: pipelineId },
    { enabled: !!sessionToken }
  );
  const pipeline = pipelineData?.pipeline;

  const { data, isLoading, isError } = trpc.list.b2b.actions.useQuery(
    { pipeline_id: pipelineId, page_size: 500 },
    { enabled: !!sessionToken }
  );

  const updateAction = trpc.update.b2b.action.useMutation();

  // Optimistic local overrides so a drag feels instant while the mutation is in flight.
  const [movedStatuses, setMovedStatuses] = useState<
    Partial<Record<number, B2BActionStatusEnum>>
  >({});

  const board = useMemo(
    () =>
      data?.list.map((action) => {
        const status = movedStatuses[action.id];
        return status ? { ...action, status } : action;
      }) ?? [],
    [data?.list, movedStatuses]
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<B2BActionStatusEnum | null>(null);

  const moveTo = (id: number, status: B2BActionStatusEnum) => {
    const current = board.find((b) => b.id === id);
    if (!current || current.status === status) return;
    const prevStatus = current.status;
    setMovedStatuses((prev) => ({ ...prev, [id]: status }));
    updateAction.mutate(
      { id, status },
      {
        onError: () => {
          setMovedStatuses((prev) => ({ ...prev, [id]: prevStatus }));
        },
        onSuccess: () => utils.list.b2b.actions.invalidate(),
      }
    );
  };

  const handleDrop = (status: B2BActionStatusEnum) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = draggedId;
    setDraggedId(null);
    if (id != null) moveTo(id, status);
  };

  return (
    <div className="px-8 py-6 flex flex-col gap-5 h-full">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          {pipeline ? `${pipeline.company_name} · ${pipeline.name}` : "Loading..."}
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          Track and move activities across the delivery workflow
        </p>
      </div>

      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load actions. You may not have access to this data.
        </p>
      )}

      {!isError && (
        <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
          {columns.map((col) => {
            const items = board.filter((b) => b.status === col.value);
            const isOver = dragOverStatus === col.value;
            return (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStatus(col.value);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOverStatus(null);
                }}
                onDrop={handleDrop(col.value)}
                className={`flex flex-col min-w-0 h-full min-h-0 gap-2 rounded-xl border p-3 transition-colors ${
                  isOver
                    ? "border-claude bg-claude/5"
                    : "border-dashboard-border bg-dashboard-bg"
                }`}
              >
                <div className="flex items-center justify-between px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-zinc-300">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${col.dot}`}
                  >
                    {isLoading ? "" : items.length}
                  </span>
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
                  {items.map((action) => {
                    const due = dueLabel(action.due_date, action.status === "DONE");
                    return (
                      <div
                        key={action.id}
                        draggable
                        onDragStart={() => setDraggedId(action.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={`rounded-lg border border-dashboard-border bg-card-bg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedId === action.id ? "opacity-50" : ""
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 line-clamp-3">
                          {action.name}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <PriorityLabel priority={action.priority} />
                            {due && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                  due.late ? "text-red-500" : "text-gray-400 dark:text-zinc-500"
                                }`}
                              >
                                <CalendarClock size={11} />
                                {due.text}
                              </span>
                            )}
                          </div>
                          <div className="flex size-5.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700 text-[10px] font-semibold text-gray-500 dark:text-zinc-300">
                            {action.assignee_avatar ? (
                              <Image
                                src={action.assignee_avatar}
                                alt={action.assignee_name ?? ""}
                                width={22}
                                height={22}
                                className="size-full object-cover"
                              />
                            ) : (
                              initialsOf(action.assignee_name)
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!isLoading && items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-6">No actions</p>
                  )}
                </div>

                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 w-full justify-start hover:bg-white dark:hover:bg-zinc-800"
                  onClick={() => setCreateStatus(col.value)}
                >
                  <Plus size={13} />
                  Add action
                </AppButton>
              </div>
            );
          })}
        </div>
      )}

      <CreateActionFormOS
        sessionToken={sessionToken}
        pipelineId={pipelineId}
        isOpen={createStatus !== null}
        defaultStatus={createStatus ?? "TO_DO"}
        onClose={() => setCreateStatus(null)}
      />
    </div>
  );
}
