"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { grantableRoleNames } from "@/trpc/utils/role_hierarchy";
import { trpc } from "@/trpc/client";
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

interface InviteUserFormOSProps {
  sessionToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteUserFormOS({
  sessionToken,
  isOpen,
  onClose,
}: InviteUserFormOSProps) {
  const utils = trpc.useUtils();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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

  const grantable = sessionData
    ? grantableRoleNames(sessionData.user.role_name)
    : [];
  const roleOptions: AppSelectOption[] =
    roleData?.list
      .filter((role) => grantable.includes(role.name))
      .map((role) => ({ value: role.id, label: role.name })) ?? [];
  const teamOptions: AppSelectOption[] = [
    { value: "", label: "No team" },
    ...(teamData?.list.map((team) => ({ value: team.id, label: team.name })) ??
      []),
  ];

  function reset() {
    setFullName("");
    setEmail("");
    setRoleId(null);
    setTeamId(null);
    setJobFunction("");
    setDataScope("OWN");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const inviteUser = trpc.create.userdata.user.useMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!roleId) return setError("Access role is required.");

    try {
      await inviteUser.mutateAsync({
        full_name: fullName.trim(),
        email: email.trim(),
        role_id: roleId,
        team_id: teamId,
        job_function: jobFunction || null,
        data_scope: dataScope,
      });
      utils.list.users.invalidate();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user.");
    }
  }

  return (
    <SheetOS
      title="Invite user"
      description="Grant a new teammate access to the OS."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <AppInput
            inputId="invite-user-name"
            label="Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
          />
          <AppInput
            inputId="invite-user-email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
          <AppSelect
            selectId="invite-user-role"
            label="Access role"
            required
            placeholder="Select access role"
            value={roleId}
            onChange={(v) => setRoleId(v as number | null)}
            options={roleOptions}
          />
          <AppSelect
            selectId="invite-user-team"
            label="Team"
            placeholder="Select team"
            value={teamId ?? ""}
            onChange={(v) => setTeamId(v ? (v as number) : null)}
            options={teamOptions}
          />
          <AppSelect
            selectId="invite-user-job-function"
            label="Job function"
            placeholder="Select job function"
            value={jobFunction}
            onChange={(v) => setJobFunction((v as JobFunctionEnum) ?? "")}
            options={jobFunctionOptions}
          />
          <AppSelect
            selectId="invite-user-data-scope"
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
            disabled={inviteUser.isPending}
          >
            {inviteUser.isPending && <Loader2 size={14} className="animate-spin" />}
            Send invite
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
