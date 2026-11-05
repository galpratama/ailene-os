import { getLmsProject, listLmsChapterSessions } from "@/apis/lms";
import LmsProjectTestCreateOS from "@/components/pages/LmsProjectTestCreateOS";
import { requireApiData } from "@/lib/api-result";
import { STATUS_NOT_FOUND } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ project_id: string }> }) {
  const { project_id: projectId } = await params;
  const [projectResult, chaptersResult] = await Promise.all([
    getLmsProject(projectId),
    listLmsChapterSessions(projectId),
  ]);
  if (projectResult.status === STATUS_NOT_FOUND) notFound();
  return <LmsProjectTestCreateOS project={requireApiData(projectResult)} chapters={requireApiData(chaptersResult)} />;
}
