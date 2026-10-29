"use client";

import type { LmsContent, LmsContentPayload } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppPdfUpload from "@/components/fields/AppPdfUpload";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextarea from "@/components/fields/AppTextArea";
import LmsMaterialEditorOS from "@/components/fields/LmsMaterialEditorOS";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { deleteLmsChapterContent, saveLmsChapterContent } from "@/lib/actions";
import { requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LmsMaterialFormOS({
  projectId,
  chapterId,
  material,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapterId: number;
  material: LmsContent | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<LmsContentPayload>({
    project_id: projectId,
    chapter_id: chapterId,
    kind: "material",
    title: material?.title ?? "",
    description: material?.description ?? "",
    status: material?.status ?? "active",
    content: material?.content ?? "",
    file_url: material?.file_url ?? "",
    image_url: material?.image_url ?? "",
    video_url: null,
    xp_reward: material?.xp_reward ?? 0,
    questions: [],
    timestamps: [],
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDocumentBusy, setIsDocumentBusy] = useState(false);
  const save = useMutation({
    mutationFn: async () =>
      requireApiSuccess(
        await saveLmsChapterContent(
          values,
          material
            ? {
                id: material.id,
                is_locked: false,
                has_progress: material.has_progress,
              }
            : null,
        ),
      ),
    onSuccess: async () => {
      toast.success("Material saved.");
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
          kind: "material",
          id: material!.id,
        }),
      ),
    onSuccess: async () => {
      toast.success("Material deleted.");
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error, "Failed to delete material."),
  });
  const busy = save.isPending || remove.isPending || isDocumentBusy;

  return (
    <SheetOS
      isOpen
      wide
      title={material ? "Edit material" : "Add material"}
      description="Write the reading for this chapter and attach a supporting document."
      onClose={() => !busy && onClose()}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <fieldset
          disabled={busy}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          <AppInput
            inputId="lms-material-title"
            label="Title"
            required
            maxLength={255}
            placeholder="e.g. How large language models work"
            value={values.title}
            onChange={(event) =>
              setValues({ ...values, title: event.target.value })
            }
          />
          <AppTextarea
            textAreaId="lms-material-description"
            label="Summary (optional)"
            rows={2}
            characterLength={10000}
            value={values.description ?? ""}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
          />
          <LmsMaterialEditorOS
            disabled={busy}
            value={values.content ?? ""}
            onChange={(html) => setValues({ ...values, content: html })}
          />
          <div className="flex flex-col gap-4">
            <AppPdfUpload
              inputId="lms-material-file"
              label="PDF document (optional)"
              value={values.file_url ?? ""}
              folderPath={`lms/materials/${projectId}/${chapterId}`}
              maxBytes={25 * 1024 * 1024}
              maxSizeLabel="25 MB"
              disabled={busy}
              onBusyChange={setIsDocumentBusy}
              onChange={(fileUrl) =>
                setValues((current) => ({ ...current, file_url: fileUrl }))
              }
            />
            <AppInput
              inputId="lms-material-cover"
              label="Cover image URL (optional)"
              type="url"
              maxLength={2000}
              placeholder="https://.../cover.webp"
              value={values.image_url ?? ""}
              onChange={(event) =>
                setValues({ ...values, image_url: event.target.value })
              }
            />
          </div>
          <AppInput
            inputId="lms-material-xp"
            label="Completion XP"
            type="number"
            required
            min={0}
            max={32767}
            containerClassName="sm:max-w-48"
            value={values.xp_reward}
            onChange={(event) =>
              setValues({ ...values, xp_reward: Number(event.target.value) })
            }
          />
          <AppSwitch
            inputId="lms-material-status"
            label="Visible to participants"
            hint="Hidden material stays saved but does not appear in the LMS."
            checked={values.status === "active"}
            onChange={(checked) =>
              setValues({ ...values, status: checked ? "active" : "inactive" })
            }
          />
        </fieldset>
        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-6 py-4">
          {material ? (
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
            <AppButton type="submit" disabled={busy}>
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Save material
            </AppButton>
          </div>
        </div>
      </form>
      <AlertConfirmationOS
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete material?"
        message="Material that participants already read cannot be deleted; hide it instead."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
      />
    </SheetOS>
  );
}
