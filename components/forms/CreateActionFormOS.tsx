"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { B2BActionPriorityEnum, B2BActionStatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export const statusOptions: AppSelectOption[] = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

export const priorityOptions: AppSelectOption[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

interface CreateActionFormOSProps {
  sessionToken: string;
  pipelineId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: B2BActionStatusEnum;
}

export default function CreateActionFormOS({
  sessionToken,
  pipelineId,
  isOpen,
  onClose,
  defaultStatus = "TO_DO",
}: CreateActionFormOSProps) {
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<B2BActionStatusEnum>(defaultStatus);
  const [priority, setPriority] = useState<B2BActionPriorityEnum>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const [error, setError] = useState<string | null>(null);

  // The form stays mounted across opens (SheetOS just hides it), so on the
  // open→closed→open transition triggered by a different column's "Add
  // action" button, re-seed status from the new defaultStatus. Adjusting
  // state during render (React's documented pattern for this) rather than
  // in an effect avoids an extra commit.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setStatus(defaultStatus);
  }

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen }
  );

  const assigneeOptions: AppSelectOption[] = [
    { value: "", label: "Unassigned" },
    ...(userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? []),
  ];

  function resetForm() {
    setName("");
    setSummary("");
    setStatus(defaultStatus);
    setPriority("MEDIUM");
    setDueDate("");
    setAssigneeId("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const createAction = trpc.create.b2b.action.useMutation({
    onSuccess: () => {
      utils.list.b2b.actions.invalidate();
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Action name is required.");

    createAction.mutate({
      pipeline_id: pipelineId,
      name: name.trim(),
      summary: summary.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
      assignee_id: assigneeId || null,
    });
  }

  return (
    <SheetOS
      title="Add New Action"
      description="Add a task to this lead's delivery workflow."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <AppInput
            inputId="action-name"
            label="Action Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Send proposal deck"
          />

          <AppTextArea
            textAreaId="action-summary"
            label="Summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Optional notes about this action..."
          />

          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              selectId="action-status"
              label="Status"
              placeholder="Pick a status"
              value={status}
              onChange={(v) => setStatus(v as B2BActionStatusEnum)}
              options={statusOptions}
            />
            <AppSelect
              selectId="action-priority"
              label="Priority"
              placeholder="Pick a priority"
              value={priority}
              onChange={(v) => setPriority(v as B2BActionPriorityEnum)}
              options={priorityOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppInput
              inputId="action-due-date"
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <AppSelect
              selectId="action-assignee"
              label="Assignee"
              placeholder="Assign someone"
              value={assigneeId}
              onChange={(v) => setAssigneeId((v as string) ?? "")}
              options={assigneeOptions}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
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
            disabled={createAction.isPending}
          >
            {createAction.isPending && <Loader2 size={14} className="animate-spin" />}
            Create Action
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
