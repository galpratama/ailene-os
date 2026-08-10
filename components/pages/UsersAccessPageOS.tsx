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
import { setSessionToken, trpc } from "@/trpc/client";
import { UserAccountStatusEnum } from "@prisma/client";
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
import { useEffect, useState } from "react";

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
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [offboardingUserId, setOffboardingUserId] = useState<string | null>(
    null
  );

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<
    string | undefined
  >();
  const [teamFilter, setTeamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() === "" ? undefined : keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const { data: teamData } = trpc.list.teams.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const teamOptions: AppSelectOption[] = [
    { value: "", label: "Filter by team" },
    ...(teamData?.list.map((team) => ({ value: team.id, label: team.name })) ??
      []),
  ];

  const { data, isLoading, isError } = trpc.list.users.useQuery(
    {
      page,
      page_size: pageSize,
      keyword: debouncedKeyword,
      team_id: teamFilter ? Number(teamFilter) : undefined,
      status: (statusFilter || undefined) as UserAccountStatusEnum | undefined,
    },
    { enabled: !!sessionToken }
  );

  const userList = data?.list;
  const totalPage = data?.metapaging.total_page ?? 1;

  const updateStatus = trpc.update.userdata.status.useMutation({
    onSuccess: () => utils.list.users.invalidate(),
  });

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
            value={teamFilter}
            options={teamOptions}
            onChange={(value) => {
              setTeamFilter(value ? String(value) : "");
              setPage(1);
            }}
          />
        </div>
        <div className="w-full max-w-48">
          <AppSelect
            selectId="users-status-filter"
            placeholder="Filter by status"
            value={statusFilter}
            options={statusOptions}
            onChange={(value) => {
              setStatusFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">
          Loading users...
        </p>
      )}
      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load users. You may not have access to this data.
        </p>
      )}

      {userList && !isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
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
                      <AccessRoleLabel roleName={entry.role_name} />
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
                              updateStatus.mutate({
                                id: entry.id,
                                status: "DEACTIVATED",
                              })
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
                                updateStatus.mutate({
                                  id: entry.id,
                                  status: "SUSPENDED",
                                })
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
                                updateStatus.mutate({
                                  id: entry.id,
                                  status: "ACTIVE",
                                })
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
                                updateStatus.mutate({
                                  id: entry.id,
                                  status: "ACTIVE",
                                })
                              }
                            >
                              <RotateCcw size={13} />
                            </AppButton>
                            <AppButton
                              variant="ghost"
                              size="iconSm"
                              title="Archive"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: entry.id,
                                  status: "ARCHIVED",
                                })
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
              <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
                {debouncedKeyword
                  ? `No users found for "${debouncedKeyword}"`
                  : "No users yet."}
              </p>
            )}
          </div>
        </div>
      )}

      <AppPaginationOS
        currentPage={page}
        totalPages={totalPage}
        onPageChange={setPage}
      />

      <InviteUserFormOS
        sessionToken={sessionToken}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <EditUserFormOS
        sessionToken={sessionToken}
        userId={editingUserId}
        isOpen={editingUserId !== null}
        onClose={() => setEditingUserId(null)}
      />

      <OffboardUserDrawerOS
        sessionToken={sessionToken}
        userId={offboardingUserId}
        isOpen={offboardingUserId !== null}
        onClose={() => setOffboardingUserId(null)}
      />
    </div>
  );
}
