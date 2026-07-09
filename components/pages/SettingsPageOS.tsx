"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import { setSessionToken, trpc } from "@/trpc/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export default function SettingsPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data } = trpc.list.trainerPool.specializations.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const createSpecialization =
    trpc.create.trainerPool.specialization.useMutation({
      onSuccess: () => {
        setName("");
        setError(null);
        utils.list.trainerPool.specializations.invalidate();
        utils.list.trainerPool.applicationOptions.invalidate();
      },
      onError: (mutationError) => setError(mutationError.message),
    });
  const deleteSpecialization =
    trpc.delete.trainerPool.specialization.useMutation({
      onSuccess: () => {
        utils.list.trainerPool.specializations.invalidate();
        utils.list.trainerPool.applicationOptions.invalidate();
      },
    });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    createSpecialization.mutate({ name: name.trim() });
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          Settings
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Manage shared lookup values used across BIZ and OS.
        </p>
      </div>
      <section className="max-w-180 rounded-xl border border-gray-300 bg-card-bg p-5">
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">
          Trainer specializations
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          These choices appear immediately on the public trainer application.
        </p>
        <form
          onSubmit={submit}
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <AppInput
            inputId="specialization-name"
            label="New specialization"
            placeholder="e.g. Sales Automation"
            value={name}
            onChange={(event) => setName(event.target.value)}
            errorMessage={error ?? undefined}
          />
          <AppButton
            type="submit"
            disabled={createSpecialization.isPending}
          >
            {createSpecialization.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </AppButton>
        </form>
        <div className="mt-5 divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-zinc-800 dark:border-zinc-800">
          {data?.list.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.trainer_count} trainer
                  {entry.trainer_count === 1 ? "" : "s"}
                </p>
              </div>
              <AppButton
                type="button"
                variant="ghost"
                size="iconSm"
                title={
                  entry.trainer_count
                    ? "Remove this specialization from trainers first"
                    : "Delete specialization"
                }
                disabled={entry.trainer_count > 0}
                onClick={() =>
                  deleteSpecialization.mutate({ id: entry.id })
                }
              >
                <Trash2 size={13} />
              </AppButton>
            </div>
          ))}
          {!data?.list.length && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              No specializations yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
