"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { editStatusOptions, priorityOptions } from "@/components/forms/CreateTaskFormOS";
import type { TaskPriority, TaskStatus } from "@/apis/tasks";
import { useSession } from "@/contexts/SessionContext";
import { useAssigneeOptions } from "@/hooks/useAssigneeOptions";
import { deleteTask, getTaskDetails, updateTask } from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { dateOrderError } from "@/lib/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

interface EditTaskFormOSProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  // The task detail page hosts this sheet itself, so it hides the full-page link.
  hideFullPageLink?: boolean;
}

export default function EditTaskFormOS({
  taskId,
  isOpen,
  onClose,
  onDeleted,
  hideFullPageLink = false,
}: EditTaskFormOSProps) {
  const queryClient = useQueryClient();
  const sessionUser = useSession();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<TaskStatus>("to_do");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { data: task, isLoading: isLoadingTask } = useQuery({
    queryKey: ["tasks", "details", taskId],
    queryFn: async () => requireApiData(await getTaskDetails(taskId!)),
    enabled: isOpen && taskId != null,
  });

  // Seed the form once per open during render; reset on close so reopening reverts unsaved edits.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [seededTaskId, setSeededTaskId] = useState<number | null>(null);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSeededTaskId(null);
  }

  if (isOpen && task && task.id !== seededTaskId) {
    setSeededTaskId(task.id);
    setName(task.name);
    setSummary(task.summary ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.start_date ?? "");
    setEndDate(task.end_date ?? "");
    setAssigneeId(task.assignee_id ?? "");
  }

  const assigneeOptions = useAssigneeOptions(isOpen);
  const dateError = dateOrderError(startDate, endDate);

  function handleClose() {
    onClose();
  }

  const updateMutation = useMutation({
    mutationFn: async (id: number) =>
      requireApiData(
        await updateTask({
          id,
          name: name.trim(),
          summary: summary.trim() || null,
          status,
          priority,
          start_date: startDate || null,
          end_date: endDate || null,
          assignee_id: assigneeId || null,
        })
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      handleClose();
    },
    onError: (cause) =>
      showErrorToast(cause instanceof Error ? cause.message : "Failed to update task."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => requireApiSuccess(await deleteTask(id)),
    onSuccess: (_data, id) => {
      setIsConfirmingDelete(false);
      handleClose();
      onDeleted?.();
      // Drop the deleted task's details first: refetching them 404s and React Query retries with backoff for ~7s.
      queryClient.removeQueries({ queryKey: ["tasks", "details", id], exact: true });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (cause) =>
      showErrorToast(cause instanceof Error ? cause.message : "Failed to delete task."),
  });

  function handleConfirmDelete() {
    if (taskId == null) return;
    deleteMutation.mutate(taskId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) return showErrorToast("Task name is required.");
    if (dateError) return;
    if (taskId == null) return;

    updateMutation.mutate(taskId);
  }

  const isReady = !isLoadingTask && !!task;
  // Mirrors the API rule: administrators delete anything, members only their own assigned tasks.
  const canDelete =
    !!sessionUser &&
    !!task &&
    (sessionUser.role === "administrator" || task.assignee_id === sessionUser.id);

  return [
    <SheetOS
      key="edit-task"
      title="Edit Task"
      description="Update this task's details."
      isOpen={isOpen}
      onClose={handleClose}
      fullPageHref={
        hideFullPageLink || taskId == null ? undefined : `/tasks/${taskId}`
      }
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

            <AppInput
              inputId="edit-task-name"
              label="Task Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Send proposal deck"
            />

            <AppTextArea
              textAreaId="edit-task-summary"
              label="Summary"
              rows={8}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Optional notes about this task..."
            />

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                selectId="edit-task-status"
                label="Status"
                placeholder="Pick a status"
                value={status}
                onChange={(v) => setStatus(v as TaskStatus)}
                options={editStatusOptions}
              />
              <AppSelect
                selectId="edit-task-priority"
                label="Priority"
                placeholder="Pick a priority"
                value={priority}
                onChange={(v) => setPriority(v as TaskPriority)}
                options={priorityOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="edit-task-start-date"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <AppInput
                inputId="edit-task-end-date"
                label="End Date"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                errorMessage={dateError}
              />
            </div>

            <AppSelect
              selectId="edit-task-assignee"
              label="Assignee"
              placeholder="Assign someone"
              value={assigneeId}
              onChange={(v) => setAssigneeId((v as string) ?? "")}
              options={assigneeOptions}
            />
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
            {canDelete && (
              <AppButton
                type="button"
                variant="destructive"
                size="icon"
                title="Delete task"
                disabled={deleteMutation.isPending}
                onClick={() => setIsConfirmingDelete(true)}
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </AppButton>
            )}
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>,
    <AlertConfirmationOS
      key="confirm-delete"
      isOpen={isConfirmingDelete}
      onClose={() => setIsConfirmingDelete(false)}
      onConfirm={handleConfirmDelete}
      title="Delete this task?"
      message={task ? `Delete “${task.name}”? This can't be undone.` : ""}
      confirmLabel="Delete"
      destructive
      isPending={deleteMutation.isPending}
    />,
  ];
}
