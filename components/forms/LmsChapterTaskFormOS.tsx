"use client";

import type {
  LmsChapterTaskDetail,
  LmsChapterTaskPayload,
  LmsTool,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppImageUpload from "@/components/fields/AppImageUpload";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextarea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import {
  createLmsChapterTask,
  deleteLmsChapterTask,
  updateLmsChapterTask,
} from "@/lib/actions";
import { requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

type DraftStep = {
  key: string;
  instruction: string;
  image_url: string;
};

function initialSteps(task: LmsChapterTaskDetail | null): DraftStep[] {
  if (!task?.steps.length) {
    return [{ key: "step-1", instruction: "", image_url: "" }];
  }
  return task.steps.map((step) => ({
    key: `existing-${step.step_number}`,
    instruction: step.instruction,
    image_url: step.image_url ?? "",
  }));
}

export default function LmsChapterTaskFormOS({
  projectId,
  chapterId,
  task,
  tools,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapterId: number;
  task: LmsChapterTaskDetail | null;
  tools: LmsTool[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const stepCounter = useRef(task?.steps.length ?? 1);
  const [toolId, setToolId] = useState(task?.tool.id ?? tools[0]?.id ?? 0);
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [orderIndex, setOrderIndex] = useState(task?.order_index ?? 0);
  const [status, setStatus] = useState(task?.status ?? "active");
  const [steps, setSteps] = useState(() => initialSteps(task));
  const [uploadingSteps, setUploadingSteps] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const payload = (): LmsChapterTaskPayload => ({
    project_id: projectId,
    tool_id: toolId,
    name: name.trim(),
    description: description.trim() || null,
    order_index: orderIndex,
    status,
    steps: steps.map((step) => ({
      instruction: step.instruction.trim(),
      image_url: step.image_url || null,
    })),
  });

  const save = useMutation({
    mutationFn: async () =>
      requireApiSuccess(
        task
          ? await updateLmsChapterTask({ ...payload(), task_id: task.id })
          : await createLmsChapterTask({ ...payload(), chapter_id: chapterId }),
      ),
    onSuccess: async () => {
      toast.success(task ? "Chapter task updated." : "Chapter task created.");
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error, "Failed to save chapter task."),
  });
  const remove = useMutation({
    mutationFn: async () => {
      if (!task) return;
      requireApiSuccess(
        await deleteLmsChapterTask({ project_id: projectId, task_id: task.id }),
      );
    },
    onSuccess: async () => {
      toast.success("Chapter task deleted.");
      await onSaved();
      onClose();
    },
    onError: (error) =>
      showErrorToast(error, "Failed to delete chapter task."),
  });
  const busy = save.isPending || remove.isPending || uploadingSteps.size > 0;

  function setStepBusy(key: string, isBusy: boolean) {
    setUploadingSteps((current) => {
      const next = new Set(current);
      if (isBusy) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function updateStep(key: string, patch: Partial<DraftStep>) {
    setSteps((current) =>
      current.map((step) => (step.key === key ? { ...step, ...patch } : step)),
    );
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    setSteps((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!toolId) return setFormError("Choose a tool for this task.");
    if (!name.trim()) return setFormError("Task name is required.");
    if (!steps.length || steps.some((step) => !step.instruction.trim())) {
      return setFormError("Every task needs at least one complete step.");
    }
    setFormError("");
    save.mutate();
  }

  return (
    <SheetOS
      isOpen
      wide
      title={task ? "Edit chapter task" : "Add chapter task"}
      description="Build the practical steps learners will follow."
      onClose={() => !busy && onClose()}
    >
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
        <fieldset
          disabled={save.isPending || remove.isPending}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
        >
          <AppSelect
            selectId="lms-chapter-task-tool"
            label="Tool"
            placeholder="Select a tool"
            required
            value={toolId || null}
            options={tools.map((tool) => ({ value: tool.id, label: tool.name }))}
            onChange={(value) => setToolId(Number(value))}
          />
          <AppInput
            inputId="lms-chapter-task-name"
            label="Task name"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Secure your AI data settings"
          />
          <AppTextarea
            textAreaId="lms-chapter-task-description"
            label="Description (optional)"
            rows={3}
            characterLength={10000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <AppInput
            inputId="lms-chapter-task-order"
            label="Display order"
            type="number"
            required
            min={0}
            max={32767}
            value={orderIndex}
            onChange={(event) => setOrderIndex(Number(event.target.value))}
          />

          <section className="flex flex-col gap-3 rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  Task steps
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                  Images are compressed to WEBP before upload.
                </p>
              </div>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                disabled={busy || steps.length >= 50}
                onClick={() => {
                  stepCounter.current += 1;
                  setSteps((current) => [
                    ...current,
                    {
                      key: `step-${stepCounter.current}`,
                      instruction: "",
                      image_url: "",
                    },
                  ]);
                }}
              >
                <Plus size={13} /> Add step
              </AppButton>
            </div>

            {steps.map((step, index) => (
              <div
                key={step.key}
                className="rounded-xl border border-line bg-card-bg p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
                    Step {index + 1}
                  </p>
                  <div className="flex items-center gap-1">
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="iconSm"
                      aria-label={`Move step ${index + 1} up`}
                      disabled={busy || index === 0}
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUp size={13} />
                    </AppButton>
                    <AppButton
                      type="button"
                      variant="secondary"
                      size="iconSm"
                      aria-label={`Move step ${index + 1} down`}
                      disabled={busy || index === steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                    >
                      <ArrowDown size={13} />
                    </AppButton>
                    <AppButton
                      type="button"
                      variant="dangerGhost"
                      size="iconSm"
                      aria-label={`Delete step ${index + 1}`}
                      disabled={busy || steps.length === 1}
                      onClick={() =>
                        setSteps((current) =>
                          current.filter((item) => item.key !== step.key),
                        )
                      }
                    >
                      <Trash2 size={13} />
                    </AppButton>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <AppTextarea
                    textAreaId={`lms-chapter-task-step-${step.key}`}
                    label="Instruction"
                    required
                    rows={3}
                    characterLength={10000}
                    value={step.instruction}
                    onChange={(event) =>
                      updateStep(step.key, { instruction: event.target.value })
                    }
                  />
                  <AppImageUpload
                    inputId={`lms-chapter-task-image-${step.key}`}
                    label="Step image (optional)"
                    value={step.image_url}
                    onChange={(imageUrl) =>
                      updateStep(step.key, { image_url: imageUrl })
                    }
                    folderPath={`chapter-tasks/steps/${projectId}/${chapterId}`}
                    maxBytes={10 * 1024 * 1024}
                    maxSizeLabel="10 MB"
                    aspectRatio="16/9"
                    imageFit="contain"
                    compact
                    compression={{ maxDimension: 1600, maxBytes: 700 * 1024 }}
                    disabled={busy}
                    onBusyChange={(isBusy) => setStepBusy(step.key, isBusy)}
                  />
                </div>
              </div>
            ))}
          </section>

          <AppSwitch
            inputId="lms-chapter-task-status"
            label="Active task"
            hint="Inactive tasks stay saved but are hidden from learners."
            checked={status === "active"}
            onChange={(checked) => setStatus(checked ? "active" : "inactive")}
          />
          {formError && (
            <p role="alert" className="text-xs text-merah">
              {formError}
            </p>
          )}
        </fieldset>

        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-5 py-4">
          {task ? (
            <AppButton
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} /> Delete
            </AppButton>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <AppButton
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" disabled={busy || tools.length === 0}>
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Save task
            </AppButton>
          </div>
        </div>
      </form>
      <AlertConfirmationOS
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete chapter task?"
        message="Tasks with learner submissions cannot be deleted. Hide the task instead if learners have already submitted it."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
      />
    </SheetOS>
  );
}
