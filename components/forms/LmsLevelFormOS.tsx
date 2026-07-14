"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import type { StatusEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export type LmsLevelEditing = {
  id: number;
  level_number: number;
  name: string;
  icon: string | null;
  min_xp: number;
  status: StatusEnum;
};

export default function LmsLevelFormOS({
  isOpen,
  onClose,
  editing,
}: {
  isOpen: boolean;
  onClose: () => void;
  editing?: LmsLevelEditing | null;
}) {
  const utils = trpc.useUtils();
  const [levelNumber, setLevelNumber] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [minXp, setMinXp] = useState("0");
  const [status, setStatus] = useState<StatusEnum>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setLevelNumber(String(editing.level_number));
      setName(editing.name);
      setIcon(editing.icon ?? "");
      setMinXp(String(editing.min_xp));
      setStatus(editing.status);
    } else {
      setLevelNumber("");
      setName("");
      setIcon("");
      setMinXp("0");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [isOpen, editing]);

  const createMutation = trpc.create.lms.level.useMutation({
    onSuccess: () => {
      utils.list.lms.levels.invalidate();
      onClose();
    },
    onError: (mutationError) => setError(mutationError.message),
  });
  const updateMutation = trpc.update.lms.level.useMutation({
    onSuccess: () => {
      utils.list.lms.levels.invalidate();
      onClose();
    },
    onError: (mutationError) => setError(mutationError.message),
  });
  const mutation = editing ? updateMutation : createMutation;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!levelNumber || !name.trim()) {
      return setError("Level number and name are required.");
    }
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        level_number: Number(levelNumber),
        name: name.trim(),
        icon: icon.trim() || null,
        min_xp: minXp ? Number(minXp) : 0,
        status,
      });
    } else {
      createMutation.mutate({
        level_number: Number(levelNumber),
        name: name.trim(),
        icon: icon.trim() || null,
        min_xp: minXp ? Number(minXp) : 0,
        status,
      });
    }
  }

  return (
    <SheetOS
      title={editing ? "Edit Level" : "New Level"}
      description="Levels group chapters into the curriculum's overall progression."
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
          <AppNumberInput
            inputId="lms-level-number"
            label="Level Number"
            required
            value={levelNumber}
            onValueChange={setLevelNumber}
          />
          <AppInput
            inputId="lms-level-name"
            label="Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <AppInput
            inputId="lms-level-icon"
            label="Icon URL"
            type="url"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="https://"
          />
          <AppNumberInput
            inputId="lms-level-min-xp"
            label="Minimum XP"
            value={minXp}
            onValueChange={setMinXp}
          />
          <AppSelect
            selectId="lms-level-status"
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
            {editing ? "Save Changes" : "Create Level"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
