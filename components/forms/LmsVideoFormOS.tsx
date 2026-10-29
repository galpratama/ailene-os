"use client";

import type { LmsContent, LmsContentPayload } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextarea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { deleteLmsChapterContent, saveLmsChapterContent } from "@/lib/actions";
import { requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LmsVideoFormOS({
  projectId,
  chapterId,
  video,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapterId: number;
  video: LmsContent | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<LmsContentPayload>({
    project_id: projectId,
    chapter_id: chapterId,
    kind: "video",
    title: video?.title ?? "",
    description: video?.description ?? "",
    status: video?.status ?? "active",
    content: null,
    file_url: null,
    image_url: null,
    video_url: video?.video_url ?? "",
    xp_reward: video?.xp_reward ?? 0,
    questions: [],
    timestamps: video?.timestamps ?? [],
  });
  const [markerError, setMarkerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = useMutation({
    mutationFn: async () =>
      requireApiSuccess(
        await saveLmsChapterContent(
          values,
          video
            ? {
                id: video.id,
                is_locked: false,
                has_progress: video.has_progress,
              }
            : null,
        ),
      ),
    onSuccess: async () => {
      toast.success("Video saved.");
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });
  const remove = useMutation({
    mutationFn: async () =>
      requireApiSuccess(
        await deleteLmsChapterContent({
          project_id: projectId,
          kind: "video",
          id: video!.id,
        }),
      ),
    onSuccess: async () => {
      toast.success("Video deleted.");
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error, "Failed to delete video."),
  });
  const busy = save.isPending || remove.isPending;
  const markers = values.timestamps;

  return (
    <SheetOS
      isOpen
      title={video ? "Edit video" : "Add video"}
      description="Paste a YouTube, Vimeo, Google Drive, or direct video link."
      onClose={() => !busy && onClose()}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (
            new Set(markers.map((marker) => marker.start_seconds)).size !==
            markers.length
          ) {
            setMarkerError("Each chapter marker needs a different start time.");
            return;
          }
          setMarkerError("");
          save.mutate();
        }}
      >
        <fieldset
          disabled={busy}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          <AppInput
            inputId="lms-video-title"
            label="Title"
            required
            maxLength={255}
            placeholder="e.g. Prompting basics"
            value={values.title}
            onChange={(event) =>
              setValues({ ...values, title: event.target.value })
            }
          />
          <AppInput
            inputId="lms-video-url"
            label="Video URL"
            required
            type="url"
            maxLength={2000}
            placeholder="https://youtu.be/..."
            value={values.video_url ?? ""}
            onChange={(event) =>
              setValues({ ...values, video_url: event.target.value })
            }
          />
          <AppTextarea
            textAreaId="lms-video-description"
            label="Description (optional)"
            rows={3}
            characterLength={10000}
            value={values.description ?? ""}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
          />
          <AppInput
            inputId="lms-video-xp"
            label="Completion XP"
            type="number"
            required
            min={0}
            max={32767}
            value={values.xp_reward}
            onChange={(event) =>
              setValues({ ...values, xp_reward: Number(event.target.value) })
            }
          />
          <section className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Chapter markers
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                Let participants jump to a topic. Start time is in seconds.
              </p>
            </div>
            {markers.map((marker, index) => (
              <div key={index} className="flex items-end gap-2">
                <AppInput
                  inputId={`lms-video-marker-time-${index}`}
                  label="Seconds"
                  containerClassName="w-24 shrink-0"
                  type="number"
                  min={0}
                  required
                  value={marker.start_seconds}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      timestamps: markers.map((item, i) =>
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
                  inputId={`lms-video-marker-title-${index}`}
                  label="Topic"
                  containerClassName="flex-1"
                  required
                  maxLength={255}
                  value={marker.title}
                  onChange={(event) =>
                    setValues({
                      ...values,
                      timestamps: markers.map((item, i) =>
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
                    setValues({
                      ...values,
                      timestamps: markers.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 size={14} />
                </AppButton>
              </div>
            ))}
            {markerError && (
              <p className="text-xs text-merah" role="alert">
                {markerError}
              </p>
            )}
            <AppButton
              type="button"
              variant="outlineDashed"
              size="dashed"
              disabled={markers.length >= 200}
              onClick={() =>
                setValues({
                  ...values,
                  timestamps: [
                    ...markers,
                    {
                      start_seconds:
                        (markers.at(-1)?.start_seconds ?? -60) + 60,
                      title: "",
                    },
                  ],
                })
              }
            >
              <Plus size={14} /> Add marker
            </AppButton>
          </section>
          <AppSwitch
            inputId="lms-video-status"
            label="Visible to participants"
            hint="Hidden videos stay saved but do not appear in the LMS."
            checked={values.status === "active"}
            onChange={(checked) =>
              setValues({ ...values, status: checked ? "active" : "inactive" })
            }
          />
        </fieldset>
        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-6 py-4">
          {video ? (
            <AppButton
              type="button"
              variant="dangerGhost"
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
            <AppButton type="submit" disabled={busy}>
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Save video
            </AppButton>
          </div>
        </div>
      </form>
      <AlertConfirmationOS
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete video?"
        message="Videos that participants already watched cannot be deleted; hide them instead."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
      />
    </SheetOS>
  );
}
