import { listLmsGroups, listLmsMembers, listLmsProjects } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsAdminProjectDetailOS from "@/components/pages/LmsAdminProjectDetailOS";
import { isLmsInsightSection } from "@/lib/lms-insights";
import { isSuccessStatus } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ project_id: string }>;
  searchParams: Promise<{ tab?: string; group?: string; insight?: string }>;
}) {
  const { project_id: projectId } = await params;
  const { tab, group, insight } = await searchParams;
  const groupId = Number(group) || null;
  const sessionToken = (await getSessionToken()) ?? "";

  // There's no single-project endpoint; the list is small and carries the name we need.
  const [projects, groups, members] = await Promise.all([
    listLmsProjects(),
    listLmsGroups(projectId),
    listLmsMembers({ project_id: projectId, group_id: groupId }),
  ]);

  const project = projects.data?.find((entry) => entry.id === projectId);
  if (isSuccessStatus(projects.status) && !project) {
    notFound();
  }

  const failed = [projects, groups, members].find(
    (result) => !isSuccessStatus(result.status),
  );

  return (
    <LmsAdminProjectDetailOS
      projectId={projectId}
      sessionToken={sessionToken}
      projectName={project?.name ?? "LMS project"}
      companyName={project?.company_name ?? null}
      groups={groups.data ?? []}
      members={members.data ?? []}
      initialTab={
        tab === "groups" || tab === "members" || tab === "content"
          ? tab
          : "insights"
      }
      initialInsight={isLmsInsightSection(insight) ? insight : "pre_assessment"}
      initialGroup={groupId}
      loadError={failed ? (failed.message ?? "Failed to load project.") : null}
    />
  );
}
