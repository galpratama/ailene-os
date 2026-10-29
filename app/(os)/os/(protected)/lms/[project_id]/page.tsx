import { getLmsProject, listLmsGroups, listLmsMembers } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsAdminProjectDetailOS from "@/components/pages/LmsAdminProjectDetailOS";
import { isSuccessStatus, STATUS_NOT_FOUND } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id: projectId } = await params;
  const sessionToken = (await getSessionToken()) ?? "";

  const [project, groups, members] = await Promise.all([
    getLmsProject(projectId),
    listLmsGroups(projectId),
    listLmsMembers({ project_id: projectId }),
  ]);

  if (project.status === STATUS_NOT_FOUND) {
    notFound();
  }

  const failed = [project, groups, members].find(
    (result) => !isSuccessStatus(result.status),
  );

  return (
    <LmsAdminProjectDetailOS
      projectId={projectId}
      sessionToken={sessionToken}
      project={project.data ?? null}
      groups={groups.data ?? []}
      members={members.data ?? []}
      loadError={failed ? (failed.message ?? "Failed to load project.") : null}
    />
  );
}
