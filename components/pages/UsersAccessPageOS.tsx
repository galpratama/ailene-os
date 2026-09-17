"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import EditUserFormOS from "@/components/forms/EditUserFormOS";
import InviteUserFormOS from "@/components/forms/InviteUserFormOS";
import AccessRoleLabel from "@/components/labels/AccessRoleLabel";
import DataScopeLabel from "@/components/labels/DataScopeLabel";
import UserStatusLabel from "@/components/labels/UserStatusLabel";
import OffboardUserDrawerOS from "@/components/modals/OffboardUserDrawerOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { updateUserStatus } from "@/lib/actions";
import type { MetaPaging, UserEntry, UserStatus } from "@/apis/users";
import type { TeamEntry } from "@/apis/teams";
import {
  Archive,
  LogOut,
  PauseCircle,
  Pencil,
  RotateCcw,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "INVITED", label: "Invited" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DEACTIVATED", label: "Deactivated" },
  { value: "ARCHIVED", label: "Archived" },
];

const jobFunctionLabels: Record<string, string> = {
  BD: "Business Development",
  SALES: "Sales",
  OPERATIONS: "Operations",
  CURRICULUM: "Curriculum",
  FINANCE: "Finance",
  IT: "IT",
};

export default function UsersAccessPageOS({
  users,
  metapaging,
  teams,
  initialKeyword,
  initialTeam,
  initialStatus,
  loadError,
}: {
  users: UserEntry[];
  metapaging: MetaPaging | null;
  teams: TeamEntry[];
  initialKeyword: string;
  initialTeam: string;
  initialStatus: string;
  loadError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [offboardingUserId, setOffboardingUserId] = useState<string | null>(
    null
  );

  // Adjust state during render when the server hands back a new keyword, rather than syncing in an effect.
  const [seenKeyword, setSeenKeyword] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  if (initialKeyword !== seenKeyword) {
    setSeenKeyword(initialKeyword);
    setKeyword(initialKeyword);
  }

  function pushParams(next: Record<string, string>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set("page", "1");
    startTransition(() => router.push(`?${params.toString()}`));
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword.trim() === initialKeyword) return;
      pushParams({ keyword: keyword.trim() });
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const teamOptions: AppSelectOption[] = [
    { value: "", label: "Filter by team" },
    ...teams.map((team) => ({ value: team.id, label: team.name })),
  ];

  const userList = users;
  const totalPage = metapaging?.total_page ?? 1;
  const currentPage = metapaging?.current_page ?? 1;

  function changeStatus(id: string, status: UserStatus) {
    startTransition(async () => {
      await updateUserStatus({ id, status });
      router.refresh();
    });
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Users & access"
        description="Manage internal OS accounts, access roles, and team membership."
        action={{
          label: "Invite user",
          icon: UserPlus,
          onClick: () => setIsInviteOpen(true),
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="users-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search users by name or email..."
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-52">
          <AppSelect
            selectId="users-team-filter"
            placeholder="Filter by team"
            value={initialTeam}
            options={teamOptions}
            onChange={(value) => pushParams({ team: value ? String(value) : "" })}
          />
        </div>
        <div className="w-full max-w-48">
          <AppSelect
            selectId="users-status-filter"
            placeholder="Filter by status"
            value={initialStatus}
            options={statusOptions}
            onChange={(value) => pushParams({ status: (value as string) ?? "" })}
          />
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700 ${isPending ? "opacity-60" : ""}`}
      >
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Access role</th>
                  <th className="px-5 py-3">Job function</th>
                  <th className="px-5 py-3">Team</th>
                  <th className="px-5 py-3">Data scope</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                          {entry.full_name}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {entry.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <AccessRoleLabel role={entry.role} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                      {entry.job_function
                        ? jobFunctionLabels[entry.job_function]
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                      {entry.team_name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <DataScopeLabel scope={entry.data_scope} />
                    </td>
                    <td className="px-5 py-3.5">
                      <UserStatusLabel status={entry.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {entry.last_login
                        ? new Date(entry.last_login).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {entry.status !== "ARCHIVED" && (
                          <AppButton
                            variant="ghost"
                            size="iconSm"
                            title="Edit access"
                            onClick={() => setEditingUserId(entry.id)}
                          >
                            <Pencil size={13} />
                          </AppButton>
                        )}

                        {entry.status === "INVITED" && (
                          <AppButton
                            variant="ghost"
                            size="iconSm"
                            title="Revoke invite"
                            onClick={() =>
                              changeStatus(entry.id, "DEACTIVATED")
                            }
                          >
                            <X size={13} />
                          </AppButton>
                        )}

                        {entry.status === "ACTIVE" && (
                          <>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Suspend"
                              onClick={() =>
                                changeStatus(entry.id, "SUSPENDED")
                              }
                            >
                              <PauseCircle size={13} />
                            </AppButton>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Offboard"
                              onClick={() => setOffboardingUserId(entry.id)}
                            >
                              <LogOut size={13} />
                            </AppButton>
                          </>
                        )}

                        {entry.status === "SUSPENDED" && (
                          <>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Reactivate"
                              onClick={() =>
                                changeStatus(entry.id, "ACTIVE")
                              }
                            >
                              <RotateCcw size={13} />
                            </AppButton>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Offboard"
                              onClick={() => setOffboardingUserId(entry.id)}
                            >
                              <LogOut size={13} />
                            </AppButton>
                          </>
                        )}

                        {entry.status === "DEACTIVATED" && (
                          <>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Reactivate"
                              onClick={() =>
                                changeStatus(entry.id, "ACTIVE")
                              }
                            >
                              <RotateCcw size={13} />
                            </AppButton>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Archive"
                              onClick={() =>
                                changeStatus(entry.id, "ARCHIVED")
                              }
                            >
                              <Archive size={13} />
                            </AppButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userList.length === 0 && (
              <p
                className={`text-sm text-center py-10 ${loadError ? "text-merah" : "text-gray-400 dark:text-zinc-500"}`}
              >
                {loadError ??
                  (initialKeyword
                    ? `No users found for "${initialKeyword}"`
                    : "No users yet.")}
              </p>
            )}
          </div>
      </div>

      <AppPaginationOS
        currentPage={currentPage}
        totalPages={totalPage}
        onPageChange={(next) => pushParams({ page: String(next) }, false)}
      />

      <InviteUserFormOS
        teams={teams}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <EditUserFormOS
        teams={teams}
        userId={editingUserId}
        isOpen={editingUserId !== null}
        onClose={() => setEditingUserId(null)}
      />

      <OffboardUserDrawerOS
        userId={offboardingUserId}
        isOpen={offboardingUserId !== null}
        onClose={() => setOffboardingUserId(null)}
      />
    </div>
  );
}
