"use client";

import type { LmsChapterEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsContentFormOS from "@/components/forms/LmsContentFormOS";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import {
  deleteLmsChapterContent,
  getLmsChapterAnalytics,
  listLmsChapterContents,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// The page has no other navigation to guard, so unsaved-change tracking is not needed here.
function ignoreDirty() {}

export default function LmsChapterTestOS({
  projectId,
  sessionToken,
  chapter,
  kind,
  loadError,
}: {
  projectId: string;
  sessionToken: string;
  chapter: LmsChapterEntry | null;
  kind: "pre_test" | "post_test";
  loadError: string | null;
}) {
  const client = useQueryClient();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const chapterId = chapter?.id ?? 0;
  const enabled = !!sessionToken && !!chapter;
  const label = kind === "pre_test" ? "Pre-test" : "Post-test";
  const chapterHref = `/lms/${projectId}/chapters/${chapterId}`;
  const contentsQuery = useQuery({
    queryKey: ["lms-chapter-contents", chapterId],
    queryFn: async () =>
      requireApiData(await listLmsChapterContents(chapterId)),
    enabled,
    refetchOnWindowFocus: false,
  });
  const analyticsQuery = useQuery({
    queryKey: ["lms-chapter-analytics", projectId, chapterId],
    queryFn: async () =>
      requireApiData(
        await getLmsChapterAnalytics({
          project_id: projectId,
          chapter_id: chapterId,
        }),
      ),
    enabled,
  });
  const test = contentsQuery.data?.find((item) => item.kind === kind);
  const stats =
    kind === "pre_test"
      ? analyticsQuery.data?.pre_test
      : analyticsQuery.data?.post_test;
  const members = analyticsQuery.data?.member_count ?? 0;

  async function refresh() {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ["lms-chapter-contents", chapterId],
      }),
      client.invalidateQueries({
        queryKey: ["lms-chapter-analytics", projectId, chapterId],
      }),
    ]);
  }

  async function removeTest() {
    if (!test) return;
    setIsDeleting(true);
    try {
      requireApiSuccess(
        await deleteLmsChapterContent({
          project_id: projectId,
          kind,
          id: test.id,
        }),
      );
      toast.success(`${label} deleted.`);
      await refresh();
      router.replace(chapterHref);
    } catch (error) {
      showErrorToast(error, `Failed to delete the ${label.toLowerCase()}.`);
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <AppButton variant="secondary" size="sm" href={chapterHref}>
          <ArrowLeft size={14} /> {chapter?.name ?? "Chapter"}
        </AppButton>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-xs text-merah"
        >
          {loadError}
        </p>
      )}

      {chapter && (
        <>
          <header className="flex flex-wrap items-end justify-between gap-6 rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-800 sm:p-8">
            <div className="min-w-0">
              <span className="rounded-full bg-lime-bright px-2.5 py-0.5 text-xs font-semibold text-forest-deep">
                {label}
              </span>
              <h1 className="mt-4 text-2xl leading-tight">
                {test?.title ?? `New ${label.toLowerCase()}`}
              </h1>
              <p className="mt-2 text-xs text-white/60">{chapter.name}</p>
            </div>
            <dl className="flex gap-8 sm:gap-10">
              {[
                {
                  label: "Questions",
                  value: test ? String(test.questions.length) : "—",
                },
                {
                  label: "Submitted",
                  value: stats ? `${stats.submitted}/${members}` : "—",
                },
                {
                  label: "Avg. score",
                  value: stats?.average_score?.toFixed(1) ?? "—",
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <dd className="font-heading text-3xl tabular-nums">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-xs text-white/55">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </header>

          <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
            {contentsQuery.isPending ? (
              <p className="px-6 py-12 text-center text-xs text-gray-500 dark:text-zinc-400">
                Loading {label.toLowerCase()}...
              </p>
            ) : contentsQuery.isError ? (
              <div className="px-6 py-10 text-center">
                <p className="text-xs text-merah">
                  {contentsQuery.error.message}
                </p>
                <AppButton
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => contentsQuery.refetch()}
                >
                  Try again
                </AppButton>
              </div>
            ) : (
              <LmsContentFormOS
                key={test?.id ?? "new"}
                projectId={projectId}
                chapterId={chapter.id}
                kind={kind}
                content={test}
                onSaved={refresh}
                onDelete={() => setConfirmDelete(true)}
                onDirtyChange={ignoreDirty}
              />
            )}
          </section>

          <AlertConfirmationOS
            isOpen={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={removeTest}
            title={`Delete ${label.toLowerCase()}?`}
            message={`Delete "${test?.title ?? ""}" and all its questions? Tests that participants already submitted cannot be deleted.`}
            confirmLabel="Delete"
            destructive
            isPending={isDeleting}
          />
        </>
      )}
    </div>
  );
}
