import { getLmsChapter, getLmsProject } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsChapterDetailOS from "@/components/pages/LmsChapterDetailOS";
import { isSuccessStatus, STATUS_NOT_FOUND } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string; chapter_id: string }>;
}) {
  const { project_id: projectId, chapter_id: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  if (!Number.isSafeInteger(chapterId) || chapterId <= 0) {
    notFound();
  }
  const sessionToken = (await getSessionToken()) ?? "";

  const [project, chapter] = await Promise.all([
    getLmsProject(projectId),
    getLmsChapter({ project_id: projectId, chapter_id: chapterId }),
  ]);

  if (project.status === STATUS_NOT_FOUND || chapter.status === STATUS_NOT_FOUND) {
    notFound();
  }

  const failed = [project, chapter].find(
    (result) => !isSuccessStatus(result.status),
  );

  return (
    <LmsChapterDetailOS
      projectId={projectId}
      sessionToken={sessionToken}
      project={project.data ?? null}
      chapter={chapter.data ?? null}
      loadError={failed ? (failed.message ?? "Failed to load chapter.") : null}
    />
  );
}
