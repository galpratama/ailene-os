import PipelineStagesPageOS from "@/components/pages/PipelineStagesPageOS";
import { getSession } from "@/apis/session";
import { notFound } from "next/navigation";

export default async function Page() {
  const { user, sessionToken } = await getSession();
  if (user?.role !== "administrator") notFound();

  return <PipelineStagesPageOS sessionToken={sessionToken ?? ""} />;
}
