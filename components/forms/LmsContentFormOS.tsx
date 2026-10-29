"use client";

import type { LmsContent, LmsContentKind, LmsContentPayload } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import LmsMaterialEditorOS from "@/components/fields/LmsMaterialEditorOS";
import AppSelect from "@/components/fields/AppSelect";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextarea from "@/components/fields/AppTextArea";
import LmsQuestionsEditorOS from "@/components/forms/LmsQuestionsEditorOS";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { saveLmsChapterContent } from "@/lib/actions";
import { requireApiSuccess } from "@/lib/api-result";
import {
  lmsContentKinds,
  lmsQuestionError,
  lmsStatusOptions,
} from "@/lib/lms-curriculum";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, LockKeyhole, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LmsContentFormOS({
  projectId,
  chapterId,
  kind,
  content,
  onSaved,
  onDelete,
  onDirtyChange,
}: {
  projectId: string;
  chapterId: number;
  kind: LmsContentKind;
  content?: LmsContent;
  onSaved: () => Promise<void>;
  onDelete: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const meta = lmsContentKinds.find((item) => item.kind === kind)!;
  const assessment =
    kind === "pre_test" || kind === "post_test" || kind === "quiz";
  const protectedAssessment = assessment && !!content?.has_progress;
  const [values, setValues] = useState<LmsContentPayload>({
    project_id: projectId,
    chapter_id: chapterId,
    kind,
    title: content?.title ?? "",
    description: content?.description ?? "",
    status: content?.status ?? "active",
    content: content?.content ?? "",
    file_url: content?.file_url ?? "",
    image_url: content?.image_url ?? "",
    video_url: content?.video_url ?? "",
    xp_reward: content?.xp_reward ?? 0,
    questions: content?.questions ?? [],
    timestamps: content?.timestamps ?? [],
    is_locked: content?.is_locked ?? false,
  });
  const [showErrors, setShowErrors] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const [timestampError, setTimestampError] = useState("");
  function update(patch: Partial<LmsContentPayload>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setDirty(true);
  }
  const mutation = useMutation({
    mutationFn: async () =>
      requireApiSuccess(
        await saveLmsChapterContent(
          values,
          content
            ? {
                id: content.id,
                is_locked: content.is_locked ?? false,
                has_progress: content.has_progress,
              }
            : null,
        ),
      ),
    onSuccess: async () => {
      toast.success(`${meta.label} saved.`);
      setDirty(false);
      await onSaved();
    },
    onError: (error) => showErrorToast(error),
  });
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setShowErrors(true);
        if (
          assessment &&
          !protectedAssessment &&
          (!values.questions.length || values.questions.some(lmsQuestionError))
        )
          return;
        if (
          new Set(values.timestamps.map((item) => item.start_seconds)).size !==
          values.timestamps.length
        ) {
          setTimestampError(
            "Each chapter marker must have a unique start time.",
          );
          return;
        }
        setTimestampError("");
        mutation.mutate();
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-5 sm:px-7">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {meta.label}
          </p>
          <h2 className="text-lg font-semibold">
            {content ? content.title : `New ${meta.label.toLowerCase()}`}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {meta.description}
          </p>
        </div>
        {content && <LmsContentStatusLabel status={content.status} />}
      </div>
      {protectedAssessment && (
        <div className="mx-5 mt-5 flex gap-2 rounded-lg border border-line bg-gray-50 p-3 text-xs text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 sm:mx-7">
          <LockKeyhole size={16} className="shrink-0" />
          <p>
            Participants have already taken this test, so its questions and
            answers are read-only. You can still change the status and lock.
          </p>
        </div>
      )}
      <fieldset
        disabled={mutation.isPending}
        className="flex min-w-0 flex-col gap-5 px-5 py-6 sm:px-7"
      >
        <AppInput
          inputId="lms-content-title"
          disabled={protectedAssessment}
          label="Title"
          required
          maxLength={255}
          placeholder={`e.g. ${meta.label} — Introduction to AI`}
          value={values.title}
          onChange={(event) => update({ title: event.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AppSelect
            selectId="lms-content-status"
            label="Status"
            placeholder="Select status"
            value={values.status}
            options={lmsStatusOptions}
            disabled={protectedAssessment || mutation.isPending}
            onChange={(value) =>
              update({ status: value as LmsContentPayload["status"] })
            }
          />
          {!assessment && (
            <AppInput
              inputId="lms-content-xp"
              label="Completion XP"
              type="number"
              required
              min={0}
              max={32767}
              value={values.xp_reward}
              onChange={(event) =>
                update({ xp_reward: Number(event.target.value) })
              }
            />
          )}
        </div>
        {assessment && (
          <AppSwitch
            inputId="lms-content-lock"
            label="Locked for participants"
            hint="Participants can see the test but cannot take it until you unlock it."
            checked={values.is_locked ?? false}
            disabled={mutation.isPending}
            onChange={(checked) => update({ is_locked: checked })}
          />
        )}
        <AppTextarea
          textAreaId="lms-content-description"
          label="Description (optional)"
          rows={3}
          characterLength={10000}
          placeholder="A short introduction for participants."
          value={values.description ?? ""}
          onChange={(event) => update({ description: event.target.value })}
        />
        {kind === "material" && (
          <>
            <LmsMaterialEditorOS
              disabled={mutation.isPending}
              value={values.content ?? ""}
              onChange={(html) => update({ content: html })}
            />
            <AppInput
              inputId="lms-material-file"
              label="Document URL (optional)"
              type="url"
              maxLength={2000}
              placeholder="https://.../lesson.pdf"
              value={values.file_url ?? ""}
              onChange={(event) => update({ file_url: event.target.value })}
            />
            <AppInput
              inputId="lms-material-cover"
              label="Cover image URL (optional)"
              type="url"
              maxLength={2000}
              placeholder="https://.../cover.webp"
              value={values.image_url ?? ""}
              onChange={(event) => update({ image_url: event.target.value })}
            />
          </>
        )}
        {kind === "video" && (
          <>
            <AppInput
              inputId="lms-video-url"
              label="Video URL"
              required
              type="url"
              maxLength={2000}
              placeholder="https://..."
              value={values.video_url ?? ""}
              onChange={(event) => update({ video_url: event.target.value })}
            />
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold">Chapter markers</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  Help participants jump to a topic. Enter the start time in
                  seconds.
                </p>
              </div>
              {values.timestamps.map((timestamp, index) => (
                <div key={index} className="flex items-end gap-2">
                  <AppInput
                    inputId={`lms-marker-time-${index}`}
                    label="Seconds"
                    containerClassName="w-24 shrink-0"
                    type="number"
                    min={0}
                    max={2147483647}
                    required
                    value={timestamp.start_seconds}
                    onChange={(event) =>
                      update({
                        timestamps: values.timestamps.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                start_seconds: Number(event.target.value),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppInput
                    inputId={`lms-marker-title-${index}`}
                    label="Topic"
                    containerClassName="flex-1"
                    placeholder="e.g. Key concepts"
                    required
                    maxLength={255}
                    value={timestamp.title}
                    onChange={(event) =>
                      update({
                        timestamps: values.timestamps.map((item, i) =>
                          i === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                  <AppButton
                    type="button"
                    variant="dangerGhost"
                    size="icon"
                    aria-label={`Remove marker ${index + 1}`}
                    onClick={() =>
                      update({
                        timestamps: values.timestamps.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </AppButton>
                </div>
              ))}
              {timestampError && (
                <p className="text-xs text-merah" role="alert">
                  {timestampError}
                </p>
              )}
              <AppButton
                type="button"
                variant="outlineDashed"
                size="dashed"
                disabled={values.timestamps.length >= 200}
                onClick={() =>
                  update({
                    timestamps: [
                      ...values.timestamps,
                      {
                        start_seconds:
                          (values.timestamps.at(-1)?.start_seconds ?? -60) + 60,
                        title: "",
                      },
                    ],
                  })
                }
              >
                <Plus size={14} />
                Add chapter marker
              </AppButton>
            </section>
          </>
        )}
        {assessment && (
          <fieldset disabled={protectedAssessment} className="min-w-0">
            <LmsQuestionsEditorOS
              value={values.questions}
              onChange={(questions) => update({ questions })}
              quiz={kind === "quiz"}
              showErrors={showErrors}
            />
          </fieldset>
        )}
      </fieldset>
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-card-bg px-5 py-4 sm:px-7">
        {content ? (
          <AppButton
            type="button"
            variant="dangerGhost"
            disabled={mutation.isPending || content.has_progress}
            title={
              content.has_progress
                ? "Content with learner progress cannot be deleted"
                : `Delete ${meta.label.toLowerCase()}`
            }
            onClick={onDelete}
          >
            <Trash2 size={14} />
            Delete
          </AppButton>
        ) : (
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            One {meta.label.toLowerCase()} per session
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-500 dark:text-zinc-400 sm:inline">
            {dirty ? (
              "Unsaved changes"
            ) : content ? (
              <span className="flex items-center gap-1">
                <Check size={12} />
                Saved
              </span>
            ) : (
              "Not created yet"
            )}
          </span>
          <AppButton
            type="submit"
            disabled={mutation.isPending || (!!content && !dirty)}
          >
            {mutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {content ? "Save changes" : `Create ${meta.label.toLowerCase()}`}
          </AppButton>
        </div>
      </div>
    </form>
  );
}
