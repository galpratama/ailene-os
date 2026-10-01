"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { USER_ROLE_OPTIONS } from "@/lib/constants";
import { getUserDetails, updateUser } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import type { TeamEntry } from "@/apis/teams";
import type {
  UserDataScope,
  UserEntry,
  UserJobFunction,
  UserRole,
} from "@/apis/users";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { showErrorToast } from "@/lib/toast";

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
  teams: TeamEntry[];
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserFormOS({
  teams,
  userId,
  isOpen,
  onClose,
}: EditUserFormOSProps) {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | "">("");
  const [teamId, setTeamId] = useState<number | null>(null);
  const [jobFunction, setJobFunction] = useState<UserJobFunction | "">("");
  const [dataScope, setDataScope] = useState<UserDataScope>("OWN");
  const [user, setUser] = useState<UserEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The sheet mounts before a row is picked, so the detail is fetched per opened user rather than up front.
  useEffect(() => {
    if (!isOpen || !userId) return;
    let active = true;
    getUserDetails(userId)
      .then((result) => {
        if (!active) return;
        if (!isSuccessStatus(result.status) || !result.data) {
          showErrorToast(result.message ?? "Failed to load user.");
          return onClose();
        }
        const entry = result.data;
        setUser(entry);
        setRole(entry.role);
        setTeamId(entry.team_id);
        setJobFunction(entry.job_function ?? "");
        setDataScope(entry.data_scope);
      })
      .catch((error) => {
        if (!active) return;
        showErrorToast(error, "Failed to load user.");
        onClose();
      });
    return () => {
      active = false;
    };
  }, [isOpen, userId, onClose]);

  const roleOptions: AppSelectOption[] = USER_ROLE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const teamOptions: AppSelectOption[] = [
    { value: "", label: "No team" },
    ...teams.map((team) => ({ value: team.id, label: team.name })),
  ];

  function handleClose() {
    setUser(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!role) return showErrorToast("Access role is required.");

    setIsSubmitting(true);
    const result = await updateUser({
      id: user.id,
      role,
      team_id: teamId,
      job_function: jobFunction || null,
      data_scope: dataScope,
    });
    setIsSubmitting(false);

    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to update user.");
    }

    router.refresh();
    handleClose();
  }

  const isReady = !!user;

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

            <AppSelect
              selectId="edit-user-role"
              label="Access role"
              required
              placeholder="Select access role"
              value={role}
              onChange={(v) => setRole(v as UserRole)}
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
              onChange={(v) => setJobFunction((v as UserJobFunction) ?? "")}
              options={jobFunctionOptions}
            />
            <AppSelect
              selectId="edit-user-data-scope"
              label="Data scope"
              placeholder="Select data scope"
              value={dataScope}
              onChange={(v) => setDataScope(v as UserDataScope)}
              options={dataScopeOptions}
            />
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
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
              disabled={isSubmitting}
            >
              {isSubmitting && (
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
