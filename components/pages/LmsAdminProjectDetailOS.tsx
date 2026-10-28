"use client";

import type { LmsGroupEntry, LmsMemberEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsTestCellOS from "@/components/elements/LmsTestCellOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import AppInput from "@/components/fields/AppInput";
import LmsGroupFormOS from "@/components/forms/LmsGroupFormOS";
import LmsMemberFormOS from "@/components/forms/LmsMemberFormOS";
import LmsProjectFormOS from "@/components/forms/LmsProjectFormOS";
import LmsMemberRoleLabel from "@/components/labels/LmsMemberRoleLabel";
import LmsPaStatusLabel from "@/components/labels/LmsPaStatusLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import LmsChapterSessionsOS from "@/components/static-sections/LmsChapterSessionsOS";
import LmsCurriculumOS from "@/components/static-sections/LmsCurriculumOS";
import LmsMemberMetricsSummaryOS from "@/components/static-sections/LmsMemberMetricsSummaryOS";
import { deleteLmsGroup, deleteLmsMember, listLmsMemberMetrics } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { lmsChapterColumns, lmsMetricsSummary } from "@/lib/lms-member-metrics";
import { isSuccessStatus } from "@/lib/status_code";
import { showErrorToast } from "@/lib/toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Building2, CalendarDays, Check, Layers3, Pencil, Plus, Search, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type SheetState<T> = { open: false } | { open: true; entry: T | null };

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(value))
    : "—";
}

function CompanyLogo({ project }: { project: LmsProjectEntry }) {
  return (
    <span className="flex size-15 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 text-white">
      {project.company_image_url ? (
        <span
          role="img"
          aria-label={`${project.company_name ?? project.name} logo`}
          className="size-full bg-white bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${JSON.stringify(project.company_image_url)})` }}
        />
      ) : (
        <Building2 size={26} />
      )}
    </span>
  );
}

export default function LmsAdminProjectDetailOS({
  projectId,
  sessionToken,
  project,
  groups,
  members,
  initialView,
  initialChapterId,
  loadError,
}: {
  projectId: string;
  sessionToken: string;
  project: LmsProjectEntry | null;
  groups: LmsGroupEntry[];
  members: LmsMemberEntry[];
  initialView: "overview" | "content";
  initialChapterId: number | null;
  loadError: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");
  const [groupFilter, setGroupFilter] = useState<number | null>(null);
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const [memberSheet, setMemberSheet] = useState<SheetState<LmsMemberEntry>>({ open: false });
  const [groupSheet, setGroupSheet] = useState<SheetState<LmsGroupEntry>>({ open: false });
  const [removingMember, setRemovingMember] = useState<LmsMemberEntry | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<LmsGroupEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contentDirty, setContentDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

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

  function navigate(href: string) {
    if (contentDirty) {
      setPendingHref(href);
      return;
    }
    startTransition(() => router.push(href));
  }

  function manageContent(chapterId?: number) {
    navigate(`/lms/${projectId}?view=content${chapterId ? `&chapter=${chapterId}` : ""}`);
  }

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

  async function confirmDeleteGroup() {
    if (!deletingGroup) return;
    setIsDeleting(true);
    try {
      const result = await deleteLmsGroup({
        project_id: projectId,
        group_id: deletingGroup.id,
      });
      if (!isSuccessStatus(result.status)) {
        showErrorToast(result.message ?? "Failed to delete group.");
        return;
      }
      toast.success(`Group "${deletingGroup.name}" was deleted.`);
      if (groupFilter === deletingGroup.id) setGroupFilter(null);
      setDeletingGroup(null);
      router.refresh();
    } catch (error) {
      showErrorToast(error, "Failed to delete group.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <AppButton variant="secondary" size="sm" onClick={() => navigate("/lms")}>
          <ArrowLeft size={14} /> All LMS projects
        </AppButton>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-sm text-merah">
          {loadError}
        </p>
      )}

      {project && (
        <header className="flex flex-wrap items-start justify-between gap-5 rounded-2xl bg-zinc-900 px-5 py-6 text-white dark:bg-zinc-800 sm:px-7">
          <div className="flex min-w-0 items-start gap-4">
            <CompanyLogo project={project} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/55">{project.company_name ?? "LMS project"}</p>
              <h1 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">{project.name}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Created {formatDate(project.created_at)}</span>
                {project.attendee_pax !== null && <span className="flex items-center gap-1.5"><Users size={13} /> Capacity {project.attendee_pax}</span>}
              </p>
            </div>
          </div>
          <AppButton variant="white" size="sm" onClick={() => setProjectSheetOpen(true)}>
            <Pencil size={13} /> Edit project
          </AppButton>
        </header>
      )}

      {initialView === "content" ? (
        <div className="min-w-0">
          <AppButton variant="secondary" size="sm" className="mb-4" onClick={() => navigate(`/lms/${projectId}`)}>
            <ArrowLeft size={14} /> Project overview
          </AppButton>
          <LmsCurriculumOS
            key={initialChapterId ?? "all"}
            projectId={projectId}
            sessionToken={sessionToken}
            groups={groups}
            initialChapterId={initialChapterId}
            onDirtyChange={setContentDirty}
          />
        </div>
      ) : (
        <div className={`grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_19rem] ${isPending ? "opacity-70" : ""}`}>
          <main className="flex min-w-0 flex-col gap-5">
            <LmsChapterSessionsOS
              projectId={projectId}
              sessionToken={sessionToken}
              groups={groups}
            />

            <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Members</h2>
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
                {groupFilter !== null && (
                  <AppButton variant="outline" size="sm" onClick={() => setGroupFilter(null)}>Show all groups</AppButton>
                )}
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
          </main>

          <aside className="flex min-w-0 flex-col gap-5">
            <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
              <div className="flex items-center justify-between gap-2 border-b border-line-soft px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Groups</h2>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">{groups.length} in this project</p>
                </div>
                <AppButton variant="outline" size="icon" title="New group" aria-label="New group" onClick={() => setGroupSheet({ open: true, entry: null })}><Plus size={15} /></AppButton>
              </div>
              {groups.length ? (
                <div className="divide-y divide-line-soft">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center gap-2 px-4 py-3.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-300"><Layers3 size={16} /></span>
                      <AppButton variant="bare" size="bare" className="min-w-0 flex-1 flex-col items-start text-left" aria-pressed={groupFilter === group.id} onClick={() => setGroupFilter(group.id)}>
                        <span className="block w-full truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{group.name}</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400">{group.member_count} {group.member_count === 1 ? "member" : "members"}</span>
                      </AppButton>
                      <AppButton variant="secondary" size="iconSm" title="Rename group" aria-label={`Rename ${group.name}`} onClick={() => setGroupSheet({ open: true, entry: group })}><Pencil size={13} /></AppButton>
                      <AppButton variant="dangerGhost" size="iconSm" title={group.member_count ? "Move members before deleting" : "Delete group"} aria-label={`Delete ${group.name}`} disabled={group.member_count > 0} onClick={() => setDeletingGroup(group)}><Trash2 size={13} /></AppButton>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-xs text-gray-500 dark:text-zinc-400">No groups yet. Create one before inviting members.</p>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
              <div className="border-b border-line-soft px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Project information</h2>
              </div>
              <dl className="divide-y divide-line-soft px-5 text-xs">
                <div className="flex items-start justify-between gap-3 py-3"><dt className="text-gray-500 dark:text-zinc-400">Company</dt><dd className="max-w-40 text-right font-semibold text-gray-800 dark:text-zinc-200">{project?.company_name ?? "—"}</dd></div>
                <div className="flex items-start justify-between gap-3 py-3"><dt className="text-gray-500 dark:text-zinc-400">Attendee capacity</dt><dd className="font-semibold tabular-nums text-gray-800 dark:text-zinc-200">{project?.attendee_pax ?? "—"}</dd></div>
                <div className="flex items-start justify-between gap-3 py-3"><dt className="text-gray-500 dark:text-zinc-400">Created</dt><dd className="font-semibold text-gray-800 dark:text-zinc-200">{formatDate(project?.created_at ?? null)}</dd></div>
                <div className="flex items-start justify-between gap-3 py-3"><dt className="text-gray-500 dark:text-zinc-400">Updated</dt><dd className="font-semibold text-gray-800 dark:text-zinc-200">{formatDate(project?.updated_at ?? null)}</dd></div>
              </dl>
            </section>

            <AppButton variant="outline" className="w-full justify-center" onClick={() => manageContent()}>
              <BookOpen size={14} /> Manage chapter content
            </AppButton>
          </aside>
        </div>
      )}

      <AlertConfirmationOS
        isOpen={pendingHref !== null}
        onClose={() => setPendingHref(null)}
        onConfirm={() => {
          setContentDirty(false);
          if (pendingHref) startTransition(() => router.push(pendingHref));
          setPendingHref(null);
        }}
        title="Discard unsaved changes?"
        message="Your content changes have not been saved. Discard them and return to the project overview?"
        confirmLabel="Discard changes"
        destructive
      />
      <LmsProjectFormOS
        project={project}
        isOpen={projectSheetOpen}
        onClose={() => setProjectSheetOpen(false)}
        onSaved={() => router.refresh()}
        onDeleted={() => router.replace("/lms")}
      />
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
        title="Remove member?"
        message={`Remove ${removingMember?.user.full_name ?? "this member"} from ${project?.name ?? "this project"}? Members with progress or submissions cannot be removed; change their group or role instead.`}
        confirmLabel="Remove"
        destructive
        isPending={isDeleting}
      />
      <AlertConfirmationOS
        isOpen={deletingGroup !== null}
        onClose={() => setDeletingGroup(null)}
        onConfirm={confirmDeleteGroup}
        title="Delete group?"
        message={`Delete the group "${deletingGroup?.name ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isPending={isDeleting}
      />
    </div>
  );
}
