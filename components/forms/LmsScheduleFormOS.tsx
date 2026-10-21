"use client";

import type {
  LmsGroupEntry,
  LmsSchedule,
  LmsSchedulePayload,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { createLmsSchedule, updateLmsSchedule } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { lmsStatusOptions } from "@/lib/lms-curriculum";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LmsScheduleFormOS({
  projectId,
  chapterId,
  groups,
  schedule,
  onClose,
  onSaved,
}: {
  projectId: string;
  chapterId: number;
  groups: LmsGroupEntry[];
  schedule: LmsSchedule | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<LmsSchedulePayload>({
    project_id: projectId,
    chapter_id: chapterId,
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
  const [date, setDate] = useState(
    schedule
      ? new Date(new Date(schedule.session_date).getTime() + 7 * 3600000)
          .toISOString()
          .slice(0, 16)
      : "",
  );
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...values,
        session_date: new Date(`${date}:00+07:00`).toISOString(),
      };
      return requireApiData(
        schedule
          ? await updateLmsSchedule({ ...payload, session_id: schedule.id })
          : await createLmsSchedule(payload),
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
      title={schedule ? "Edit schedule" : "Add schedule"}
      description="Set when and which groups attend this session."
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
            label="Date and time (WIB)"
            type="datetime-local"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
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
              { value: "offline", label: "In person" },
            ]}
            onChange={(value) =>
              setValues({
                ...values,
                method: value as LmsSchedulePayload["method"],
              })
            }
          />
          <AppInput
            inputId="lms-schedule-location"
            label={values.method === "online" ? "Platform" : "Venue"}
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
          <AppSelect
            selectId="lms-schedule-status"
            label="Status"
            placeholder="Select status"
            value={values.status}
            options={lmsStatusOptions}
            onChange={(value) =>
              setValues({
                ...values,
                status: value as LmsSchedulePayload["status"],
              })
            }
          />
          <AppSelect
            selectId="lms-schedule-lock"
            label="Content access"
            placeholder="Select access"
            value={values.is_locked ? "locked" : "open"}
            options={[
              {
                value: "locked",
                label: "Locked — participants cannot open content",
              },
              {
                value: "open",
                label: "Open — participants can access content",
              },
            ]}
            onChange={(value) =>
              setValues({ ...values, is_locked: value === "locked" })
            }
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            The date does not automatically unlock content. A group-specific
            schedule takes precedence over an all-groups schedule.
          </p>
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
            Save schedule
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
