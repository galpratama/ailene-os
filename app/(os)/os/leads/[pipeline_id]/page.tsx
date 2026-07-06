import PipelineKanbanOS from "@/components/pages/PipelineKanbanOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ pipeline_id: string }>;
}) {
  const { pipeline_id } = await params;
  const pipelineId = Number(pipeline_id);
  if (!Number.isInteger(pipelineId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return <PipelineKanbanOS sessionToken={sessionToken} pipelineId={pipelineId} />;
}
