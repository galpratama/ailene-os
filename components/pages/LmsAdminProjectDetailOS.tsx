"use client";

import type { LmsGroupEntry, LmsMemberEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import LmsGroupFormOS from "@/components/forms/LmsGroupFormOS";
import LmsProjectFormOS from "@/components/forms/LmsProjectFormOS";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import LmsChapterSessionsOS from "@/components/static-sections/LmsChapterSessionsOS";
import LmsCurriculumOS from "@/components/static-sections/LmsCurriculumOS";
import { deleteLmsGroup } from "@/lib/actions";
import { isSuccessStatus } from "@/lib/status_code";
import { showErrorToast } from "@/lib/toast";
import { ArrowLeft, BookOpen, Building2, CalendarDays, ChevronRight, Layers3, Pencil, Plus, Trash2, Users } from "lucide-react";
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
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const [groupSheet, setGroupSheet] = useState<SheetState<LmsGroupEntry>>({ open: false });
  const [deletingGroup, setDeletingGroup] = useState<LmsGroupEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contentDirty, setContentDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

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
          </main>

          <aside className="flex min-w-0 flex-col gap-5">
            <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
              <AppButton variant="row" size="rowWide" className="justify-between" href={`/lms/${projectId}/members`}>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Members</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">{members.length} in this project</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-gray-400 dark:text-zinc-500" />
              </AppButton>
              {members.length > 0 && (
                <div className="flex items-center border-t border-line-soft px-5 py-3.5">
                  <div className="flex -space-x-2">
                    {members.slice(0, 6).map((member) => (
                      <span key={member.access_id} className="rounded-full ring-2 ring-card-bg">
                        <TaskAssigneeAvatarOS name={member.user.full_name} avatar={member.user.avatar} size="base" />
                      </span>
                    ))}
                  </div>
                  {members.length > 6 && (
                    <span className="ml-2 text-xs tabular-nums text-gray-500 dark:text-zinc-400">+{members.length - 6}</span>
                  )}
                </div>
              )}
            </section>

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
                      <AppButton variant="bare" size="bare" className="min-w-0 flex-1 flex-col items-start text-left" title={`View members in ${group.name}`} onClick={() => navigate(`/lms/${projectId}/members?group=${group.id}`)}>
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
      <LmsGroupFormOS
        projectId={projectId}
        group={groupSheet.open ? groupSheet.entry : null}
        isOpen={groupSheet.open}
        onClose={() => setGroupSheet({ open: false })}
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
