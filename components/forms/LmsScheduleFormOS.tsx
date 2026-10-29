"use client";

import type {
  CreateLmsSchedulePayload,
  LmsGroupEntry,
  LmsNewChapterPayload,
  LmsSchedule,
  LmsSchedulePayload,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextarea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { createLmsSchedule, updateLmsSchedule } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { lmsStatusOptions } from "@/lib/lms-curriculum";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type ChapterOption = { id: number; name: string };
type LevelOption = { id: number; name: string };

function segmentClass(active: boolean) {
  return `h-7 rounded-md px-3 text-xs font-semibold transition-colors ${
    active
      ? "bg-lime-bright text-forest-deep"
      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

export default function LmsScheduleFormOS({
  projectId,
  chapterId,
  chapters = [],
  levels = [],
  groups,
  schedule,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapterId: number | null;
  chapters?: ChapterOption[];
  levels?: LevelOption[];
  groups: LmsGroupEntry[];
  schedule: LmsSchedule | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const canChooseChapter = !schedule && chapterId === null;
  const [chapterMode, setChapterMode] = useState<"new" | "existing">(
    canChooseChapter ? "new" : "existing",
  );
  const [values, setValues] = useState<LmsSchedulePayload>({
    project_id: projectId,
    chapter_id: chapterId ?? 0,
    only_group_id: schedule?.only_group_id ?? null,
    session_date: schedule?.session_date ?? "",
    duration_minutes: schedule?.duration_minutes ?? 90,
    location_name: schedule?.location_name ?? "",
    location_url: schedule?.location_url ?? "",
    method: schedule?.method ?? "online",
    trainer_id: schedule?.trainer_id ?? null,
    status: schedule?.status ?? "active",
    is_locked: schedule?.is_locked ?? true,
  });
  const [newChapter, setNewChapter] = useState<LmsNewChapterPayload>({
    level_id: levels[0]?.id ?? 0,
    name: "",
    description: null,
    status: "active",
  });
  const [date, setDate] = useState(
    schedule
      ? new Date(new Date(schedule.session_date).getTime() + 7 * 3600000)
          .toISOString()
          .slice(0, 16)
      : "",
  );
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [chapterNameError, setChapterNameError] = useState<string | null>(null);
  const [levelError, setLevelError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const { chapter_id, ...scheduleValues } = values;
      const common = {
        ...scheduleValues,
        session_date: new Date(`${date}:00+07:00`).toISOString(),
      };
      const createPayload: CreateLmsSchedulePayload =
        chapterMode === "existing"
          ? { ...common, chapter_id }
          : {
              ...common,
              new_chapter: {
                ...newChapter,
                name: newChapter.name.trim(),
                description: newChapter.description?.trim() || null,
              },
            };
      return requireApiData(
        schedule
          ? await updateLmsSchedule({
              ...common,
              chapter_id,
              session_id: schedule.id,
            })
          : await createLmsSchedule(createPayload),
      );
    },
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });
  return (
    <SheetOS
      isOpen
      title={schedule ? "Edit session" : "Add session"}
      description={
        canChooseChapter
          ? "Create a new chapter or schedule an existing chapter."
          : "Set when and which groups attend this session."
      }
      onClose={() => !mutation.isPending && onClose()}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (chapterMode === "existing" && !values.chapter_id) {
            setChapterError("Choose a chapter.");
            return;
          }
          if (chapterMode === "new") {
            const nextNameError = !newChapter.name.trim()
              ? "Chapter name is required."
              : null;
            const nextLevelError = !newChapter.level_id
              ? "Choose a learning level."
              : null;
            setChapterNameError(nextNameError);
            setLevelError(nextLevelError);
            if (nextNameError || nextLevelError) return;
          }
          mutation.mutate();
        }}
      >
        <fieldset
          disabled={mutation.isPending}
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          {canChooseChapter && (
            <div className="flex flex-col gap-4 rounded-xl border border-line-soft bg-gray-50 p-4 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                    Chapter
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Create a chapter with this session, or use one that already exists.
                  </p>
                </div>
                <div className="flex shrink-0 rounded-lg border border-line bg-white p-0.5 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => {
                      setChapterMode("new");
                      setChapterError(null);
                    }}
                    className={segmentClass(chapterMode === "new")}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    disabled={!chapters.length}
                    onClick={() => {
                      setChapterMode("existing");
                      setChapterNameError(null);
                      setLevelError(null);
                    }}
                    className={segmentClass(chapterMode === "existing")}
                  >
                    Existing
                  </button>
                </div>
              </div>
              {chapterMode === "existing" ? (
                <div>
                  <AppSelect
                    selectId="lms-schedule-chapter"
                    label="Chapter"
                    placeholder="Select chapter"
                    required
                    value={values.chapter_id || null}
                    options={chapters.map((chapter) => ({
                      value: chapter.id,
                      label: chapter.name,
                    }))}
                    onChange={(value) => {
                      setChapterError(null);
                      setValues({ ...values, chapter_id: Number(value) || 0 });
                    }}
                  />
                  {chapterError && (
                    <p className="mt-1.5 text-xs text-merah">{chapterError}</p>
                  )}
                </div>
              ) : (
                <>
                  <AppInput
                    inputId="lms-schedule-new-chapter-name"
                    label="Chapter name"
                    required
                    maxLength={255}
                    placeholder="e.g. Introduction to AI"
                    value={newChapter.name}
                    errorMessage={chapterNameError ?? undefined}
                    onChange={(event) => {
                      setChapterNameError(null);
                      setNewChapter({ ...newChapter, name: event.target.value });
                    }}
                  />
                  <div>
                    <AppSelect
                      selectId="lms-schedule-new-chapter-level"
                      label="Learning level"
                      placeholder="Select a level"
                      required
                      value={newChapter.level_id || null}
                      options={levels.map((level) => ({
                        value: level.id,
                        label: level.name,
                      }))}
                      onChange={(value) => {
                        setLevelError(null);
                        setNewChapter({
                          ...newChapter,
                          level_id: Number(value) || 0,
                        });
                      }}
                    />
                    {levelError && (
                      <p className="mt-1.5 text-xs text-merah">{levelError}</p>
                    )}
                  </div>
                  <AppTextarea
                    textAreaId="lms-schedule-new-chapter-description"
                    label="Chapter description"
                    rows={3}
                    characterLength={10000}
                    placeholder="What will participants learn in this chapter?"
                    value={newChapter.description ?? ""}
                    onChange={(event) =>
                      setNewChapter({
                        ...newChapter,
                        description: event.target.value,
                      })
                    }
                  />
                  <AppSelect
                    selectId="lms-schedule-new-chapter-status"
                    label="Chapter status"
                    placeholder="Select status"
                    value={newChapter.status}
                    options={lmsStatusOptions}
                    onChange={(value) =>
                      setNewChapter({
                        ...newChapter,
                        status: value as LmsNewChapterPayload["status"],
                      })
                    }
                  />
                </>
              )}
            </div>
          )}
          <div className="space-y-4 rounded-xl border border-line-soft bg-gray-50 p-4 dark:bg-zinc-800/50">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Session details
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                Set the audience, schedule, and meeting location.
              </p>
            </div>
            <AppSelect
              selectId="lms-schedule-group"
              label="Audience"
              placeholder="All groups"
              value={values.only_group_id ?? ""}
              options={[
                { value: "", label: "All groups" },
                ...groups.map((group) => ({
                  value: group.id,
                  label: group.name,
                })),
              ]}
              onChange={(value) =>
                setValues({
                  ...values,
                  only_group_id: value ? Number(value) : null,
                })
              }
            />
            <AppInput
              inputId="lms-schedule-date"
              label="Schedule"
              type="datetime-local"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="lms-schedule-duration"
                label="Duration (minutes)"
                type="number"
                required
                min={1}
                max={1440}
                value={values.duration_minutes}
                onChange={(event) =>
                  setValues({
                    ...values,
                    duration_minutes: Number(event.target.value),
                  })
                }
              />
              <AppSelect
                selectId="lms-schedule-method"
                label="Delivery"
                placeholder="Select delivery"
                value={values.method}
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                ]}
                onChange={(value) =>
                  setValues({
                    ...values,
                    method: value as LmsSchedulePayload["method"],
                  })
                }
              />
            </div>
            <AppInput
              inputId="lms-schedule-location"
              label="Platform/Location"
              placeholder={
                values.method === "online"
                  ? "e.g. Zoom"
                  : "e.g. Main training room"
              }
              required
              maxLength={255}
              value={values.location_name}
              onChange={(event) =>
                setValues({ ...values, location_name: event.target.value })
              }
            />
            <AppInput
              inputId="lms-schedule-url"
              label={
                values.method === "online"
                  ? "Meeting URL (optional)"
                  : "Location URL (optional)"
              }
              type="url"
              maxLength={2000}
              placeholder="https://..."
              value={values.location_url}
              onChange={(event) =>
                setValues({ ...values, location_url: event.target.value })
              }
            />
          </div>

          <div className="space-y-3 rounded-xl border border-line-soft bg-gray-50 p-4 dark:bg-zinc-800/50">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Access and status
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                Control session availability and participant access.
              </p>
            </div>
            <AppSwitch
              inputId="lms-schedule-status"
              label="Active session"
              hint="Active sessions are available to participants."
              checked={values.status === "active"}
              disabled={mutation.isPending}
              onChange={(checked) =>
                setValues({
                  ...values,
                  status: checked ? "active" : "inactive",
                })
              }
            />
            <AppSwitch
              inputId="lms-schedule-lock"
              label="Locked session"
              hint="Participants cannot access chapter content while this session is locked."
              checked={values.is_locked}
              disabled={mutation.isPending}
              onChange={(checked) =>
                setValues({ ...values, is_locked: checked })
              }
            />
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <AppButton
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Save session
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
