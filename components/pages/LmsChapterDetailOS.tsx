"use client";

import type { LmsChapterEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { getLmsCurriculum } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";

export default function LmsChapterDetailOS({
  projectId,
  sessionToken,
  project,
  chapter,
  loadError,
}: {
  projectId: string;
  sessionToken: string;
  project: LmsProjectEntry | null;
  chapter: LmsChapterEntry | null;
  loadError: string | null;
}) {
  // Same key as the project overview, so the level order is usually already cached.
  const curriculumQuery = useQuery({
    queryKey: ["lms-curriculum", projectId],
    queryFn: async () => requireApiData(await getLmsCurriculum(projectId)),
    enabled: !!sessionToken,
    refetchOnWindowFocus: false,
  });
  const levelIndex = curriculumQuery.data?.levels.findIndex((level) => level.id === chapter?.level_id) ?? -1;

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

      {chapter && (
        <>
          <header className="rounded-2xl border border-line bg-card-bg px-5 py-5 sm:px-6">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {levelIndex >= 0 ? `Level ${levelIndex + 1}` : chapter.level_name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight text-gray-900 dark:text-zinc-100">
                {chapter.name}
              </h1>
              {chapter.status !== "active" && <LmsContentStatusLabel status={chapter.status} />}
            </div>
            {chapter.description && (
              <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-zinc-400">{chapter.description}</p>
            )}
          </header>

          <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
            <div className="border-b border-line-soft px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Materials</h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">Learning content inside this chapter.</p>
            </div>
            <div className="px-6 py-12 text-center">
              <FileText size={24} className="mx-auto text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-zinc-200">Material management is coming soon</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">This page will hold the chapter&apos;s material CRUD.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
