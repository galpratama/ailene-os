"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import LmsGroupFormOS from "@/components/forms/LmsGroupFormOS";
import LmsMemberFormOS from "@/components/forms/LmsMemberFormOS";
import LmsMemberRoleLabel from "@/components/labels/LmsMemberRoleLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { deleteLmsGroup, deleteLmsMember } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import type { LmsGroupEntry, LmsMemberEntry } from "@/apis/lms";
import { Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Tab = "members" | "groups";

function segmentClass(active: boolean) {
  return `h-7 px-3 rounded-md text-xs font-semibold transition-colors ${
    active
      ? "bg-lime-bright text-forest-deep"
      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

// Sheets need to tell "closed" apart from "open for a new entry", so both states are explicit.
type SheetState<T> = { open: false } | { open: true; entry: T | null };

export default function LmsAdminProjectDetailOS({
  projectId,
  projectName,
  companyName,
  groups,
  members,
  initialTab,
  initialGroup,
  loadError,
}: {
  projectId: string;
  projectName: string;
  companyName: string | null;
  groups: LmsGroupEntry[];
  members: LmsMemberEntry[];
  initialTab: Tab;
  initialGroup: number | null;
  loadError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [keyword, setKeyword] = useState("");
  const [memberSheet, setMemberSheet] = useState<SheetState<LmsMemberEntry>>({
    open: false,
  });
  const [groupSheet, setGroupSheet] = useState<SheetState<LmsGroupEntry>>({
    open: false,
  });
  const [removingMember, setRemovingMember] = useState<LmsMemberEntry | null>(
    null
  );
  const [deletingGroup, setDeletingGroup] = useState<LmsGroupEntry | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  function pushParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => router.push(`?${params.toString()}`));
  }

  const tab = initialTab;

  const groupFilterOptions: AppSelectOption[] = [
    { value: "", label: "All groups" },
    ...groups.map((group) => ({ value: group.id, label: group.name })),
  ];

  // The API lists the whole project at once, so name/email search stays local.
  const query = keyword.trim().toLowerCase();
  const visibleMembers = query
    ? members.filter(
        (member) =>
          member.user.full_name.toLowerCase().includes(query) ||
          member.user.email.toLowerCase().includes(query)
      )
    : members;

  async function confirmRemoveMember() {
    if (!removingMember) return;
    setIsDeleting(true);
    const result = await deleteLmsMember({
      project_id: projectId,
      access_id: removingMember.access_id,
    });
    setIsDeleting(false);

    if (!isSuccessStatus(result.status)) {
      toast.error("Couldn't remove member.", { description: result.message });
      return;
    }
    toast.success(`${removingMember.user.full_name} was removed.`);
    setRemovingMember(null);
    router.refresh();
  }

  async function confirmDeleteGroup() {
    if (!deletingGroup) return;
    setIsDeleting(true);
    const result = await deleteLmsGroup({
      project_id: projectId,
      group_id: deletingGroup.id,
    });
    setIsDeleting(false);

    if (!isSuccessStatus(result.status)) {
      toast.error("Couldn't delete group.", { description: result.message });
      return;
    }
    toast.success(`Group "${deletingGroup.name}" was deleted.`);
    setDeletingGroup(null);
    if (initialGroup === deletingGroup.id) pushParams({ group: "" });
    else router.refresh();
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/lms"
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← LMS
        </Link>
        <PageHeaderOS
          title={projectName}
          description={companyName ?? undefined}
          action={
            tab === "members"
              ? {
                  label: "Invite member",
                  icon: UserPlus,
                  onClick: () => setMemberSheet({ open: true, entry: null }),
                }
              : {
                  label: "New group",
                  icon: Plus,
                  onClick: () => setGroupSheet({ open: true, entry: null }),
                }
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => pushParams({ tab: "" })}
            className={segmentClass(tab === "members")}
          >
            Members ({members.length})
          </button>
          <button
            type="button"
            onClick={() => pushParams({ tab: "groups" })}
            className={segmentClass(tab === "groups")}
          >
            Groups ({groups.length})
          </button>
        </div>

        {tab === "members" && (
          <>
            <AppInput
              inputId="lms-members-search"
              icon={<Search size={14} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by name or email..."
              className="max-w-full sm:max-w-sm"
            />
            <div className="w-full max-w-52">
              <AppSelect
                selectId="lms-members-group-filter"
                placeholder="All groups"
                value={initialGroup ?? ""}
                options={groupFilterOptions}
                onChange={(value) =>
                  pushParams({ group: value ? String(value) : "" })
                }
              />
            </div>
          </>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700 ${isPending ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          {tab === "members" ? (
            <table className="w-full min-w-220 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Job title</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Group</th>
                  <th className="px-5 py-3">Last active</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((member) => (
                  <tr
                    key={member.access_id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                          {member.user.full_name}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {member.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                      {member.user.job_title || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <LmsMemberRoleLabel role={member.role} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                      {member.group.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {member.user.last_active_at
                        ? formatDate(member.user.last_active_at)
                        : "Never signed in"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {formatDate(member.joined_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <AppButton
                          variant="ghost"
                          size="iconSm"
                          title="Edit member"
                          onClick={() =>
                            setMemberSheet({ open: true, entry: member })
                          }
                        >
                          <Pencil size={13} />
                        </AppButton>
                        <AppButton
                          variant="ghost"
                          size="iconSm"
                          title="Remove from project"
                          onClick={() => setRemovingMember(member)}
                        >
                          <Trash2 size={13} />
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-150 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Group</th>
                  <th className="px-5 py-3">Members</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                      {group.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          pushParams({ tab: "", group: String(group.id) })
                        }
                        className="text-gray-600 hover:text-claude hover:underline dark:text-zinc-300"
                      >
                        {group.member_count}{" "}
                        {group.member_count === 1 ? "member" : "members"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {formatDate(group.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <AppButton
                          variant="ghost"
                          size="iconSm"
                          title="Rename group"
                          onClick={() =>
                            setGroupSheet({ open: true, entry: group })
                          }
                        >
                          <Pencil size={13} />
                        </AppButton>
                        <AppButton
                          variant="ghost"
                          size="iconSm"
                          title={
                            group.member_count > 0
                              ? "Move or remove its members before deleting"
                              : "Delete group"
                          }
                          disabled={group.member_count > 0}
                          onClick={() => setDeletingGroup(group)}
                        >
                          <Trash2 size={13} />
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(tab === "members" ? visibleMembers : groups).length === 0 && (
            <p
              className={`text-sm text-center py-10 ${loadError ? "text-merah" : "text-gray-400 dark:text-zinc-500"}`}
            >
              {loadError ??
                (tab === "groups"
                  ? "No groups yet. Create one before inviting members."
                  : query
                    ? `No members found for "${keyword.trim()}"`
                    : "No members yet.")}
            </p>
          )}
        </div>
      </div>

      <LmsMemberFormOS
        projectId={projectId}
        groups={groups}
        member={memberSheet.open ? memberSheet.entry : null}
        isOpen={memberSheet.open}
        onClose={() => setMemberSheet({ open: false })}
      />

      <LmsGroupFormOS
        projectId={projectId}
        group={groupSheet.open ? groupSheet.entry : null}
        isOpen={groupSheet.open}
        onClose={() => setGroupSheet({ open: false })}
      />

      <AlertConfirmationOS
        isOpen={removingMember !== null}
        onClose={() => setRemovingMember(null)}
        onConfirm={confirmRemoveMember}
        title="Remove member"
        message={`Remove ${removingMember?.user.full_name ?? "this member"} from ${projectName}? Members who already have progress, submissions or notes can't be removed — change their group or role instead.`}
        confirmLabel="Remove"
        destructive
        isPending={isDeleting}
      />

      <AlertConfirmationOS
        isOpen={deletingGroup !== null}
        onClose={() => setDeletingGroup(null)}
        onConfirm={confirmDeleteGroup}
        title="Delete group"
        message={`Delete the group "${deletingGroup?.name ?? ""}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        isPending={isDeleting}
      />
    </div>
  );
}
