"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import type { StatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export type LmsChapterEditing = {
  id: number;
  level_id: number;
  name: string;
  description: string | null;
  session_date: string | Date;
  status: StatusEnum;
};

function toDateInputValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export default function LmsChapterFormOS({
  isOpen,
  onClose,
  editing,
}: {
  isOpen: boolean;
  onClose: () => void;
  editing?: LmsChapterEditing | null;
}) {
  const utils = trpc.useUtils();
  const [levelId, setLevelId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState<StatusEnum>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const { data: levelData } = trpc.list.lms.levels.useQuery(
    { page: 1, page_size: 200 },
    { enabled: isOpen }
  );
  const levelOptions: AppSelectOption[] =
    levelData?.list.map((level) => ({
      value: level.id,
      label: `L${level.level_number} · ${level.name}`,
    })) ?? [];

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setLevelId(editing.level_id);
      setName(editing.name);
      setDescription(editing.description ?? "");
      setSessionDate(toDateInputValue(editing.session_date));
      setStatus(editing.status);
    } else {
      setLevelId(null);
      setName("");
      setDescription("");
      setSessionDate("");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [isOpen, editing]);

  const createMutation = trpc.create.lms.chapter.useMutation({
    onSuccess: () => {
      utils.list.lms.chapters.invalidate();
      onClose();
    },
    onError: (mutationError) => setError(mutationError.message),
  });
  const updateMutation = trpc.update.lms.chapter.useMutation({
    onSuccess: () => {
      utils.list.lms.chapters.invalidate();
      onClose();
    },
    onError: (mutationError) => setError(mutationError.message),
  });
  const mutation = editing ? updateMutation : createMutation;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!levelId || !name.trim() || !sessionDate) {
      return setError("Level, name, and session date are required.");
    }
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        level_id: levelId,
        name: name.trim(),
        description: description.trim() || null,
        session_date: sessionDate,
        status,
      });
    } else {
      createMutation.mutate({
        level_id: levelId,
        name: name.trim(),
        description: description.trim() || null,
        session_date: sessionDate,
        status,
      });
    }
  }

  return (
    <SheetOS
      title={editing ? "Edit Chapter" : "New Chapter"}
      description="Chapters group quizzes, videos, and materials under a level."
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <AppSelect
            selectId="lms-chapter-level"
            label="Level"
            required
            placeholder="Select level"
            value={levelId}
            options={levelOptions}
            onChange={(value) => setLevelId(value as number | null)}
          />
          <AppInput
            inputId="lms-chapter-name"
            label="Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <AppTextArea
            textAreaId="lms-chapter-description"
            label="Description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <AppInput
            inputId="lms-chapter-session-date"
            label="Session Date"
            type="date"
            required
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
          <AppSelect
            selectId="lms-chapter-status"
            label="Status"
            placeholder="Select status"
            value={status}
            options={statusOptions}
            onChange={(value) => setStatus((value as StatusEnum) ?? "ACTIVE")}
          />
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={onClose}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            className="flex-1 justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {editing ? "Save Changes" : "Create Chapter"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
