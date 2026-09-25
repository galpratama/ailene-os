"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { priorityOptions, statusOptions } from "@/components/forms/CreateActionFormOS";
import type { ActionPriority, ActionStatus } from "@/apis/actions";
import { useAssigneeOptions } from "@/hooks/useAssigneeOptions";
import { getActionDetails, updateAction } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface EditActionFormOSProps {
  actionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditActionFormOS({
  actionId,
  isOpen,
  onClose,
}: EditActionFormOSProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<ActionStatus>("to_do");
  const [priority, setPriority] = useState<ActionPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: action, isLoading: isLoadingAction } = useQuery({
    queryKey: ["actions", "details", actionId],
    queryFn: async () => requireApiData(await getActionDetails(actionId!)),
    enabled: isOpen && actionId != null,
  });

  // Seed the form once per action, adjusting state during render (React's
  // documented pattern for this) rather than in an effect. Reset the seeded
  // marker on close so re-opening the same action always reverts to its
  // saved values instead of leaving stale in-progress edits behind.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [seededActionId, setSeededActionId] = useState<number | null>(null);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSeededActionId(null);
  }

  if (isOpen && action && action.id !== seededActionId) {
    setSeededActionId(action.id);
    setName(action.name);
    setSummary(action.summary ?? "");
    setStatus(action.status);
    setPriority(action.priority);
    setDueDate(action.due_date ?? "");
    setAssigneeId(action.assignee_id ?? "");
  }

  const assigneeOptions = useAssigneeOptions(isOpen);

  function handleClose() {
    setError(null);
    onClose();
  }

  const updateMutation = useMutation({
    mutationFn: async (id: number) =>
      requireApiData(
        await updateAction({
          id,
          name: name.trim(),
          summary: summary.trim() || null,
          status,
          priority,
          due_date: dueDate || null,
          assignee_id: assigneeId || null,
        })
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
      handleClose();
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "Failed to update action."),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Action name is required.");
    if (actionId == null) return;

    updateMutation.mutate(actionId);
  }

  const isReady = !isLoadingAction && !!action;

  return (
    <SheetOS
      title="Edit Action"
      description="Update this action's details."
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <AppInput
              inputId="edit-action-name"
              label="Action Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Send proposal deck"
            />

            <AppTextArea
              textAreaId="edit-action-summary"
              label="Summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Optional notes about this action..."
            />

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                selectId="edit-action-status"
                label="Status"
                placeholder="Pick a status"
                value={status}
                onChange={(v) => setStatus(v as ActionStatus)}
                options={statusOptions}
              />
              <AppSelect
                selectId="edit-action-priority"
                label="Priority"
                placeholder="Pick a priority"
                value={priority}
                onChange={(v) => setPriority(v as ActionPriority)}
                options={priorityOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="edit-action-due-date"
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <AppSelect
                selectId="edit-action-assignee"
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>
  );
}
