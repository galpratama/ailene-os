import LmsProjectDetailOS from "@/components/pages/LmsProjectDetailOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;
  const projectId = Number(project_id);
  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return (
    <LmsProjectDetailOS sessionToken={sessionToken} projectId={projectId} />
  );
}
