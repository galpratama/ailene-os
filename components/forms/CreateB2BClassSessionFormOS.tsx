"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import type { B2BClassDifficultyEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const difficultyOptions: AppSelectOption[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "ADVANCED", label: "Advanced" },
];

export default function CreateB2BClassSessionFormOS({
  classId,
  isOpen,
  onClose,
}: {
  classId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] =
    useState<B2BClassDifficultyEnum>("BEGINNER");
  const [minQuorum, setMinQuorum] = useState("2");
  const [sessionDate, setSessionDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function close() {
    setName("");
    setDifficulty("BEGINNER");
    setMinQuorum("2");
    setSessionDate("");
    setError(null);
    onClose();
  }

  const mutation = trpc.create.b2bClass.session.useMutation({
    onSuccess: () => {
      utils.read.b2bClass.class.invalidate({ id: classId });
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return setError("Session name is required.");
    }
    mutation.mutate({
      class_id: classId,
      name: name.trim(),
      difficulty,
      min_quorum: minQuorum ? Number(minQuorum) : undefined,
      session_date: sessionDate || null,
    });
  }

  return (
    <SheetOS
      title="New Session"
      description="Add a module/session to this class. Difficulty and quorum lock once opened."
      isOpen={isOpen}
      onClose={close}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <AppInput
            inputId="session-name"
            label="Session Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <AppSelect
            selectId="session-difficulty"
            label="Difficulty"
            placeholder="Select difficulty"
            required
            value={difficulty}
            options={difficultyOptions}
            onChange={(value) =>
              setDifficulty((value as B2BClassDifficultyEnum) ?? "BEGINNER")
            }
          />
          <AppNumberInput
            inputId="session-min-quorum"
            label="Minimum Applicants (quorum)"
            value={minQuorum}
            onValueChange={setMinQuorum}
          />
          <AppInput
            inputId="session-date"
            label="Session Date"
            type="date"
            value={sessionDate}
            onChange={(event) => setSessionDate(event.target.value)}
          />
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={close}
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
            Add Session
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
