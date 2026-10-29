import { getLmsProject, listLmsGroups, listLmsMembers } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsProjectMembersOS from "@/components/pages/LmsProjectMembersOS";
import { isSuccessStatus, STATUS_NOT_FOUND } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { project_id: projectId } = await params;
  const { group } = await searchParams;
  const groupId = Number(group);
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
    <LmsProjectMembersOS
      projectId={projectId}
      sessionToken={sessionToken}
      project={project.data ?? null}
      groups={groups.data ?? []}
      members={members.data ?? []}
      initialGroupId={Number.isSafeInteger(groupId) && groupId > 0 ? groupId : null}
      loadError={failed ? (failed.message ?? "Failed to load members.") : null}
    />
  );
}
