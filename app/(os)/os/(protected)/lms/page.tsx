import { listLmsProjects } from "@/apis/lms";
import LmsAdminProjectListOS from "@/components/pages/LmsAdminProjectListOS";
import { isSuccessStatus } from "@/lib/status_code";

export default async function Page() {
  const projects = await listLmsProjects();

  return (
    <LmsAdminProjectListOS
      projects={projects.data ?? []}
      loadError={
        isSuccessStatus(projects.status)
          ? null
          : (projects.message ?? "Failed to load projects.")
      }
    />
  );
}
