import { listLmsProjects } from "@/apis/lms";
import { getSessionToken } from "@/apis/session";
import LmsAdminProjectListOS from "@/components/pages/LmsAdminProjectListOS";
import { isSuccessStatus } from "@/lib/status_code";

export default async function Page() {
  const [projects, sessionToken] = await Promise.all([
    listLmsProjects(),
    getSessionToken(),
  ]);

  return (
    <LmsAdminProjectListOS
      projects={projects.data ?? []}
      sessionToken={sessionToken ?? ""}
      loadError={
        isSuccessStatus(projects.status)
          ? null
          : (projects.message ?? "Failed to load projects.")
      }
    />
  );
}
