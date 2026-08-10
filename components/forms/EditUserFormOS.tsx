"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { grantableRoleNames } from "@/trpc/utils/role_hierarchy";
import { DataScopeEnum, JobFunctionEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const jobFunctionOptions: AppSelectOption[] = [
  { value: "", label: "No job function" },
  { value: "BD", label: "Business Development" },
  { value: "SALES", label: "Sales" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "CURRICULUM", label: "Curriculum" },
  { value: "FINANCE", label: "Finance" },
  { value: "IT", label: "IT" },
];

const dataScopeOptions: AppSelectOption[] = [
  { value: "OWN", label: "Own data" },
  { value: "TEAM", label: "Team data" },
  { value: "GLOBAL", label: "All data" },
];

interface EditUserFormOSProps {
  sessionToken: string;
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserFormOS({
  sessionToken,
  userId,
  isOpen,
  onClose,
}: EditUserFormOSProps) {
  const utils = trpc.useUtils();

  const [roleId, setRoleId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [jobFunction, setJobFunction] = useState<JobFunctionEnum | "">("");
  const [dataScope, setDataScope] = useState<DataScopeEnum>("OWN");
  const [error, setError] = useState<string | null>(null);

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const { data: roleData } = trpc.list.roles.useQuery(undefined, {
    enabled: !!sessionToken && isOpen,
  });
  const { data: teamData } = trpc.list.teams.useQuery(undefined, {
    enabled: !!sessionToken && isOpen,
  });
  const { data, isLoading: isLoadingUser } = trpc.read.userdata.user.useQuery(
    { id: userId ?? "" },
    { enabled: !!sessionToken && isOpen && userId != null }
  );

  // Seed the form once per user, adjusting state during render (same pattern as EditLeadFormOS).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [seededUserId, setSeededUserId] = useState<string | null>(null);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSeededUserId(null);
  }

  const user = data?.user;
  if (isOpen && user && user.id !== seededUserId) {
    setSeededUserId(user.id);
    setRoleId(user.role_id);
    setTeamId(user.team_id);
    setJobFunction(user.job_function ?? "");
    setDataScope(user.data_scope);
  }

  const grantable = sessionData
    ? grantableRoleNames(sessionData.user.role_name)
    : [];
  const roleOptions: AppSelectOption[] =
    roleData?.list
      .filter(
        (role) => grantable.includes(role.name) || role.id === user?.role_id
      )
      .map((role) => ({ value: role.id, label: role.name })) ?? [];
  const teamOptions: AppSelectOption[] = [
    { value: "", label: "No team" },
    ...(teamData?.list.map((team) => ({ value: team.id, label: team.name })) ??
      []),
  ];

  function handleClose() {
    setError(null);
    onClose();
  }

  const updateProfile = trpc.update.userdata.profile.useMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!roleId) return setError("Access role is required.");

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        role_id: roleId,
        team_id: teamId,
        job_function: jobFunction || null,
        data_scope: dataScope,
      });
      utils.list.users.invalidate();
      utils.read.userdata.user.invalidate({ id: user.id });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user.");
    }
  }

  const isReady = !isLoadingUser && !!user;

  return (
    <SheetOS
      title="Edit user access"
      description={user ? `${user.full_name} · ${user.email}` : undefined}
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <AppSelect
              selectId="edit-user-role"
              label="Access role"
              required
              placeholder="Select access role"
              value={roleId}
              onChange={(v) => setRoleId(v as number | null)}
              options={roleOptions}
            />
            <AppSelect
              selectId="edit-user-team"
              label="Team"
              placeholder="Select team"
              value={teamId ?? ""}
              onChange={(v) => setTeamId(v ? (v as number) : null)}
              options={teamOptions}
            />
            <AppSelect
              selectId="edit-user-job-function"
              label="Job function"
              placeholder="Select job function"
              value={jobFunction}
              onChange={(v) => setJobFunction((v as JobFunctionEnum) ?? "")}
              options={jobFunctionOptions}
            />
            <AppSelect
              selectId="edit-user-data-scope"
              label="Data scope"
              placeholder="Select data scope"
              value={dataScope}
              onChange={(v) => setDataScope(v as DataScopeEnum)}
              options={dataScopeOptions}
            />
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Save changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>
  );
}
