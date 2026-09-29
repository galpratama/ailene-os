"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import GoogleCalendarConnectionOS from "@/components/settings/GoogleCalendarConnectionOS";
import {
  createTeam,
  createTrainerSpecialization,
  deleteTrainerSpecialization,
  listTrainerSpecializations,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { isSuccessStatus } from "@/lib/status_code";
import type { TeamEntry } from "@/apis/teams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

export default function SettingsPageOS({
  sessionToken,
  teams,
}: {
  sessionToken: string;
  teams: TeamEntry[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const { data } = useQuery({
    queryKey: ["trainer-specializations"],
    queryFn: async () => requireApiData(await listTrainerSpecializations()),
    enabled: !!sessionToken,
  });
  async function refreshSpecializations() {
    await queryClient.invalidateQueries({ queryKey: ["trainer-specializations"] });
  }
  const createSpecialization = useMutation({
    mutationFn: async (specializationName: string) =>
      requireApiData(await createTrainerSpecialization(specializationName)),
    onSuccess: async () => {
      setName("");
      await refreshSpecializations();
    },
    onError: (error) => showErrorToast(error),
  });
  const deleteSpecialization = useMutation({
    mutationFn: async (id: number) => requireApiSuccess(await deleteTrainerSpecialization(id)),
    onSuccess: refreshSpecializations,
    onError: (error) => showErrorToast(error),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    createSpecialization.mutate(name.trim());
  }

  const [teamName, setTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  async function submitTeam(event: FormEvent) {
    event.preventDefault();
    if (!teamName.trim()) return;

    setIsCreatingTeam(true);
    const result = await createTeam(teamName.trim());
    setIsCreatingTeam(false);

    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to create team.");
    }

    setTeamName("");
    router.refresh();
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
      <GoogleCalendarConnectionOS sessionToken={sessionToken} />

      <section className="max-w-180 rounded-xl border border-line bg-card-bg p-5">
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
        <div className="mt-5 divide-y divide-line-soft rounded-xl border border-line-soft">
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
                  deleteSpecialization.mutate(entry.id)
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

      <section className="max-w-180 rounded-xl border border-line bg-card-bg p-5">
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">Teams</h3>
        <p className="mt-1 text-sm text-gray-500">
          Team membership is used to scope data access and ownership reassignment.
        </p>
        <form
          onSubmit={submitTeam}
          className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        >
          <AppInput
            inputId="team-name"
            label="New team"
            placeholder="e.g. Business Development"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
          <AppButton type="submit" disabled={isCreatingTeam}>
            {isCreatingTeam ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </AppButton>
        </form>
        <div className="mt-5 divide-y divide-line-soft rounded-xl border border-line-soft">
          {teams.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.user_count} user{entry.user_count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
          {!teams.length && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              No teams yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
