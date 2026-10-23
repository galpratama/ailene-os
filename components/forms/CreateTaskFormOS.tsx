"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import type { TaskPriority, TaskStatus } from "@/apis/tasks";
import { useSession } from "@/contexts/SessionContext";
import { useAssigneeOptions } from "@/hooks/useAssigneeOptions";
import { createTask } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { dateOrderError, todayDateKey } from "@/lib/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

export const statusOptions: AppSelectOption[] = [
  { value: "to_do", label: "To Do" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

// Archiving takes a task off the board, so only an existing task offers it.
export const editStatusOptions: AppSelectOption[] = [
  ...statusOptions,
  { value: "archived", label: "Archived" },
];

export const priorityOptions: AppSelectOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface CreateTaskFormOSProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  defaultDate?: string;
}

export default function CreateTaskFormOS({
  isOpen,
  onClose,
  defaultStatus = "to_do",
  defaultDate,
}: CreateTaskFormOSProps) {
  const queryClient = useQueryClient();
  const sessionUser = useSession();
  // Non-global users get "Me" from the empty pick; global users would otherwise default to Unassigned.
  const defaultAssigneeId =
    sessionUser?.data_scope === "global" ? sessionUser.id : "";

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);


  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  // Calendar creation uses the selected day; other entry points use today's date on each open.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStatus(defaultStatus);
      const date = defaultDate ?? todayDateKey();
      setStartDate(date);
      setEndDate(date);
    }
  }

  const assigneeOptions = useAssigneeOptions(isOpen);
  const dateError = dateOrderError(startDate, endDate);

  function resetForm() {
    setName("");
    setSummary("");
    setStatus(defaultStatus);
    setPriority("medium");
    setStartDate("");
    setEndDate("");
    setAssigneeId(defaultAssigneeId);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const createMutation = useMutation({
    mutationFn: async () =>
      requireApiData(
        await createTask({
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
      showErrorToast(cause instanceof Error ? cause.message : "Failed to create task."),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) return showErrorToast("Task name is required.");
    if (dateError) return;

    createMutation.mutate();
  }

  return (
    <SheetOS
      title="Add New Task"
      description="Add a task to the board."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          <AppInput
            inputId="task-name"
            label="Task Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Send proposal deck"
          />

          <AppTextArea
            textAreaId="task-summary"
            label="Summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Optional notes about this task..."
          />

          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              selectId="task-status"
              label="Status"
              placeholder="Pick a status"
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              options={statusOptions}
            />
            <AppSelect
              selectId="task-priority"
              label="Priority"
              placeholder="Pick a priority"
              value={priority}
              onChange={(v) => setPriority(v as TaskPriority)}
              options={priorityOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppInput
              inputId="task-start-date"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <AppInput
              inputId="task-end-date"
              label="End Date"
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              errorMessage={dateError}
            />
          </div>

          <AppSelect
            selectId="task-assignee"
            label="Assignee"
            placeholder="Assign someone"
            value={assigneeId}
            onChange={(v) => setAssigneeId((v as string) ?? "")}
            options={assigneeOptions}
          />
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
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
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Create Task
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
