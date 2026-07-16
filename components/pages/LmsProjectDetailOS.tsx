"use client";

import AppButton from "@/components/buttons/AppButton";
import LmsChapterFormOS, {
  type LmsChapterEditing,
} from "@/components/forms/LmsChapterFormOS";
import LmsStatusLabel from "@/components/labels/LmsStatusLabel";
import LmsChapterTrainerPoolModalOS, {
  type LmsChapterTrainerPoolTarget,
} from "@/components/modals/LmsChapterTrainerPoolModalOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LmsProjectDetailOS({
  sessionToken,
  projectId,
}: {
  sessionToken: string;
  projectId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [chapterFormOpen, setChapterFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<LmsChapterEditing | null>(
    null
  );
  const [trainerPoolChapter, setTrainerPoolChapter] =
    useState<LmsChapterTrainerPoolTarget>(null);

  const { data, isLoading, isError } = trpc.read.lms.project.useQuery(
    { id: projectId },
    { enabled: !!sessionToken }
  );
  const { data: chapterData } = trpc.list.lms.chapters.useQuery(
    { project_id: projectId, page: 1, page_size: 100 },
    { enabled: !!sessionToken }
  );

  function openCreateChapter() {
    setEditingChapter(null);
    setChapterFormOpen(true);
  }
  function openEditChapter(chapter: LmsChapterEditing) {
    setEditingChapter(chapter);
    setChapterFormOpen(true);
  }

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading project...
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Project not found or you do not have access.
      </p>
    );
  }
  const project = data.project;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <Link
          href="/lms/projects"
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← Corporate Training
        </Link>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          {project.name}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {project.company_name ?? "No linked company"}
        </p>
      </div>

      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Chapters
          </h3>
          <AppButton size="sm" onClick={openCreateChapter}>
            <Plus size={13} />
            Create Chapter
          </AppButton>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Level</th>
                <th className="py-2 pr-4">Session Date</th>
                <th className="py-2 pr-4">Trainer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {chapterData?.list.map((chapter) => (
                <tr
                  key={chapter.id}
                  className="border-b border-gray-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-gray-900 dark:text-zinc-100">
                      {chapter.name}
                    </p>
                    {chapter.description && (
                      <p className="mt-0.5 max-w-70 truncate text-xs text-gray-500">
                        {chapter.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-zinc-300">
                    L{chapter.level_number} · {chapter.level_name}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-zinc-300">
                    {new Date(chapter.session_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-zinc-300">
                    {chapter.trainer_name ?? "Unassigned"}
                  </td>
                  <td className="py-3 pr-4">
                    <LmsStatusLabel status={chapter.status} />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="relative">
                        <AppButton
                          size="iconSm"
                          variant="outline"
                          onClick={() =>
                            setTrainerPoolChapter({
                              id: chapter.id,
                              name: chapter.name,
                            })
                          }
                          title="Trainer Pool"
                        >
                          <Users size={13} />
                        </AppButton>
                        {chapter.pending_request_count > 0 && (
                          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-claude text-[10px] font-bold text-white">
                            {chapter.pending_request_count}
                          </span>
                        )}
                      </div>
                      <AppButton
                        size="iconSm"
                        variant="outline"
                        onClick={() =>
                          openEditChapter({
                            id: chapter.id,
                            level_id: chapter.level_id,
                            name: chapter.name,
                            description: chapter.description,
                            session_date: chapter.session_date,
                            status: chapter.status,
                            method: chapter.method,
                            location_url: chapter.location_url,
                            location_name: chapter.location_name,
                            duration_minutes: chapter.duration_minutes,
                          })
                        }
                      >
                        <Pencil size={13} />
                      </AppButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {chapterData?.list.length === 0 && (
            <p className="py-5 text-sm text-gray-400">No chapters yet.</p>
          )}
        </div>
      </section>

      <LmsChapterFormOS
        isOpen={chapterFormOpen}
        onClose={() => setChapterFormOpen(false)}
        editing={editingChapter}
        projectId={projectId}
      />

      <LmsChapterTrainerPoolModalOS
        chapter={trainerPoolChapter}
        onClose={() => setTrainerPoolChapter(null)}
      />
    </div>
  );
}
