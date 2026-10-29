"use client";

import type { LmsGroupEntry, LmsMemberEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsTestCellOS from "@/components/elements/LmsTestCellOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import LmsMemberFormOS from "@/components/forms/LmsMemberFormOS";
import LmsMemberRoleLabel from "@/components/labels/LmsMemberRoleLabel";
import LmsPaStatusLabel from "@/components/labels/LmsPaStatusLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import LmsMemberMetricsSummaryOS from "@/components/static-sections/LmsMemberMetricsSummaryOS";
import { deleteLmsMember, listLmsMemberMetrics } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { lmsChapterColumns, lmsMetricsSummary } from "@/lib/lms-member-metrics";
import { isSuccessStatus } from "@/lib/status_code";
import { showErrorToast } from "@/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SheetState<T> = { open: false } | { open: true; entry: T | null };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsProjectMembersOS({
  projectId,
  sessionToken,
  project,
  groups,
  members,
  initialGroupId,
  loadError,
}: {
  projectId: string;
  sessionToken: string;
  project: LmsProjectEntry | null;
  groups: LmsGroupEntry[];
  members: LmsMemberEntry[];
  initialGroupId: number | null;
  loadError: string | null;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [groupFilter, setGroupFilter] = useState<number | null>(initialGroupId);
  const [memberSheet, setMemberSheet] = useState<SheetState<LmsMemberEntry>>({ open: false });
  const [removingMember, setRemovingMember] = useState<LmsMemberEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const query = keyword.trim().toLowerCase();
  const visibleMembers = members.filter(
    (member) =>
      (groupFilter === null || member.group.id === groupFilter) &&
      (!query ||
        member.user.full_name.toLowerCase().includes(query) ||
        member.user.email.toLowerCase().includes(query) ||
        member.user.job_title.toLowerCase().includes(query)),
  );

  // Member edits refresh the server props; keying on them refetches metrics for added, moved, or removed members.
  const membersKey = members.map((member) => `${member.access_id}:${member.group.id}:${member.role}`).join(",");
  const metricsQuery = useQuery({
    queryKey: ["lms-member-metrics", projectId, membersKey],
    queryFn: async () => requireApiData(await listLmsMemberMetrics({ project_id: projectId })),
    enabled: !!sessionToken,
  });
  const metrics = metricsQuery.data ?? [];
  const metricsByAccess = new Map(metrics.map((entry) => [entry.access_id, entry]));
  const chapterColumns = lmsChapterColumns(metrics);
  const visibleAccessIds = new Set(visibleMembers.map((member) => member.access_id));
  const metricsSummary = lmsMetricsSummary(metrics.filter((entry) => visibleAccessIds.has(entry.access_id)));

  async function confirmRemoveMember() {
    if (!removingMember) return;
    setIsDeleting(true);
    try {
      const result = await deleteLmsMember({
        project_id: projectId,
        access_id: removingMember.access_id,
      });
      if (!isSuccessStatus(result.status)) {
        showErrorToast(result.message ?? "Failed to remove member.");
        return;
      }
      toast.success(`${removingMember.user.full_name} was removed.`);
      setRemovingMember(null);
      router.refresh();
    } catch (error) {
      showErrorToast(error, "Failed to remove member.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <AppButton variant="secondary" size="sm" href={`/lms/${projectId}`}>
          <ArrowLeft size={14} /> {project?.name ?? "Project overview"}
        </AppButton>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-sm text-merah">
          {loadError}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-4 sm:px-6">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Members</h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
              {groupFilter === null ? `All ${members.length} project members` : `Members in ${groups.find((group) => group.id === groupFilter)?.name ?? "selected group"}`}
            </p>
          </div>
          <AppButton size="sm" onClick={() => setMemberSheet({ open: true, entry: null })}>
            <UserPlus size={13} /> Invite member
          </AppButton>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <AppInput
            inputId="lms-members-search"
            icon={<Search size={14} />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search members..."
            containerClassName="w-full sm:max-w-sm"
          />
          <AppSelect
            selectId="lms-members-group"
            className="w-full sm:w-56"
            placeholder="All groups"
            value={groupFilter}
            onChange={(value) => setGroupFilter(typeof value === "number" ? value : null)}
            options={[{ label: "All groups", value: null }, ...groups.map((group) => ({ label: group.name, value: group.id }))]}
          />
        </div>
        <div className="flex flex-col gap-3 px-5 pb-4 sm:px-6">
          {metricsQuery.isError ? (
            <p role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-xs text-merah">
              {metricsQuery.error.message}
              <AppButton variant="outline" size="sm" onClick={() => metricsQuery.refetch()}>Try again</AppButton>
            </p>
          ) : (
            <LmsMemberMetricsSummaryOS summary={metricsSummary} />
          )}
          {chapterColumns.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-zinc-400">
              <span className="font-medium text-gray-600 dark:text-zinc-300">Each chapter shows pre-test · post-test:</span>
              <span className="flex items-center gap-1.5"><span className="flex size-5 items-center justify-center rounded border border-hijau/30 bg-hijau-t/40 text-[10px] font-semibold text-gray-700 dark:text-zinc-200">80</span>Score</span>
              <span className="flex items-center gap-1.5"><span className="flex size-5 items-center justify-center rounded border border-hijau/30 bg-hijau-t/40 text-gray-700 dark:text-zinc-200"><Check size={11} /></span>Submitted, no score</span>
              <span className="flex items-center gap-1.5"><span className="size-5 rounded border border-dashed border-line" />Not yet</span>
              <span className="flex items-center gap-1.5"><span className="w-5 text-center text-gray-300 dark:text-zinc-600">·</span>No test</span>
              <span className="flex items-center gap-1.5"><span className="w-5 text-center text-gray-300 dark:text-zinc-600">—</span>Not scheduled</span>
            </p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-y border-line-soft text-xs font-medium text-gray-400 dark:text-zinc-500">
                <th className="px-5 py-3 sm:px-6">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Pre-assessment</th>
                {chapterColumns.map((column, index) => (
                  <th key={column.chapterId} className="px-2 py-3 text-center" title={column.chapterName}>
                    <span className="mx-auto block max-w-24 truncate">{index + 1}. {column.chapterName}</span>
                  </th>
                ))}
                <th className="px-4 py-3">Last active</th>
                <th className="px-5 py-3 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member) => (
                <tr key={member.access_id} className="border-b border-line-soft last:border-0 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <TaskAssigneeAvatarOS name={member.user.full_name} avatar={member.user.avatar} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">{member.user.full_name}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{member.user.email}</p>
                        {member.user.job_title && <p className="truncate text-xs text-gray-400 dark:text-zinc-500">{member.user.job_title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><LmsMemberRoleLabel role={member.role} /></td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-zinc-300">{member.group.name}</td>
                  <td className="px-4 py-3">
                    {metricsQuery.isPending ? (
                      <span className="block h-6 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
                    ) : member.role === "sponsor" || !metricsByAccess.has(member.access_id) ? (
                      <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>
                    ) : (
                      <LmsPaStatusLabel status={metricsByAccess.get(member.access_id)!.pre_assessment.status} band={null} meetsTarget={false} />
                    )}
                  </td>
                  {chapterColumns.map((column) => {
                    const session = metricsByAccess.get(member.access_id)?.sessions.find((entry) => entry.chapter_id === column.chapterId);
                    return (
                      <td key={column.chapterId} className="px-2 py-3">
                        <LmsTestCellOS
                          chapterName={column.chapterName}
                          scheduled={!!session && member.role !== "sponsor"}
                          preTest={session?.pre_test ?? null}
                          postTest={session?.post_test ?? null}
                        />
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-zinc-400">
                    {member.user.last_active_at ? formatDate(member.user.last_active_at) : "Never signed in"}
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <AppButton variant="secondary" size="iconSm" title="Edit member" aria-label={`Edit ${member.user.full_name}`} onClick={() => setMemberSheet({ open: true, entry: member })}><Pencil size={13} /></AppButton>
                      <AppButton variant="dangerGhost" size="iconSm" title="Remove member" aria-label={`Remove ${member.user.full_name}`} onClick={() => setRemovingMember(member)}><Trash2 size={13} /></AppButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleMembers.length && (
            <p className="px-6 py-10 text-center text-sm text-gray-500 dark:text-zinc-400">
              {query || groupFilter !== null ? "No members match this filter." : "No members yet. Invite the first member."}
            </p>
          )}
        </div>
      </section>

      <LmsMemberFormOS
        projectId={projectId}
        groups={groups}
        member={memberSheet.open ? memberSheet.entry : null}
        isOpen={memberSheet.open}
        onClose={() => setMemberSheet({ open: false })}
      />
      <AlertConfirmationOS
        isOpen={removingMember !== null}
        onClose={() => setRemovingMember(null)}
        onConfirm={confirmRemoveMember}
        title="Remove member?"
        message={`Remove ${removingMember?.user.full_name ?? "this member"} from ${project?.name ?? "this project"}? Members with progress or submissions cannot be removed; change their group or role instead.`}
        confirmLabel="Remove"
        destructive
        isPending={isDeleting}
      />
    </div>
  );
}
