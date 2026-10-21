"use client";

import type { LmsChapter, LmsChapterPayload, LmsCurriculum } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppTextarea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { createLmsChapter, updateLmsChapter } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { lmsStatusOptions } from "@/lib/lms-curriculum";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LmsChapterFormOS({
  projectId,
  chapter,
  levels,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapter: LmsChapter | null;
  levels: LmsCurriculum["levels"];
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [values, setValues] = useState<LmsChapterPayload>({
    project_id: projectId,
    level_id: chapter?.level_id ?? levels[0]?.id ?? 0,
    name: chapter?.name ?? "",
    description: chapter?.description ?? "",
    status: chapter?.status ?? "active",
  });
  const mutation = useMutation({
    mutationFn: async () =>
      requireApiData(
        chapter
          ? await updateLmsChapter({ ...values, chapter_id: chapter.id })
          : await createLmsChapter(values),
      ),
    onSuccess: (data) => onSaved(data.id),
    onError: (error) => showErrorToast(error),
  });
  return (
    <SheetOS
      isOpen
      title={chapter ? "Edit session" : "New session"}
      description="Organize learning content into a session."
      onClose={() => !mutation.isPending && onClose()}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <fieldset
          disabled={mutation.isPending}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          <AppInput
            inputId="lms-session-name"
            label="Session name"
            required
            maxLength={255}
            placeholder="e.g. Introduction to AI"
            value={values.name}
            onChange={(event) =>
              setValues({ ...values, name: event.target.value })
            }
          />
          <AppSelect
            selectId="lms-session-level"
            label="Learning level"
            placeholder="Select a level"
            required
            value={values.level_id}
            options={levels.map((level) => ({
              value: level.id,
              label: level.name,
            }))}
            onChange={(value) =>
              setValues({ ...values, level_id: Number(value) })
            }
          />
          <AppTextarea
            textAreaId="lms-session-description"
            label="Description"
            rows={4}
            characterLength={10000}
            placeholder="What will participants learn in this session?"
            value={values.description ?? ""}
            onChange={(event) =>
              setValues({ ...values, description: event.target.value })
            }
          />
          <AppSelect
            selectId="lms-session-status"
            label="Status"
            placeholder="Select status"
            value={values.status}
            options={lmsStatusOptions}
            onChange={(value) =>
              setValues({
                ...values,
                status: value as LmsChapterPayload["status"],
              })
            }
          />
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <AppButton
            variant="outline"
            type="button"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            disabled={mutation.isPending || !values.level_id}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {chapter ? "Save changes" : "Create session"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
