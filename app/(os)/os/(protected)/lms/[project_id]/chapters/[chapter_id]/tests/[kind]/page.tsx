import { getLmsChapter, getLmsProject } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsChapterTestOS from "@/components/pages/LmsChapterTestOS";
import { isSuccessStatus, STATUS_NOT_FOUND } from "@/lib/status_code";
import { notFound } from "next/navigation";

const kinds = { "pre-test": "pre_test", "post-test": "post_test" } as const;

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string; chapter_id: string; kind: string }>;
}) {
  const {
    project_id: projectId,
    chapter_id: chapterParam,
    kind,
  } = await params;
  const chapterId = Number(chapterParam);
  if (!Number.isSafeInteger(chapterId) || chapterId <= 0 || !(kind in kinds)) {
    notFound();
  }
  const sessionToken = (await getSessionToken()) ?? "";

  const [project, chapter] = await Promise.all([
    getLmsProject(projectId),
    getLmsChapter({ project_id: projectId, chapter_id: chapterId }),
  ]);

  if (
    project.status === STATUS_NOT_FOUND ||
    chapter.status === STATUS_NOT_FOUND
  ) {
    notFound();
  }

  const failed = [project, chapter].find(
    (result) => !isSuccessStatus(result.status),
  );

  return (
    <LmsChapterTestOS
      projectId={projectId}
      sessionToken={sessionToken}
      chapter={chapter.data ?? null}
      kind={kinds[kind as keyof typeof kinds]}
      loadError={failed ? (failed.message ?? "Failed to load chapter.") : null}
    />
  );
}
