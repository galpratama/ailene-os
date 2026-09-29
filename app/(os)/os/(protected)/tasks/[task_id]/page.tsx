import TaskDetailOS from "@/components/pages/TaskDetailOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ task_id: string }>;
}) {
  const { task_id } = await params;
  const taskId = Number(task_id);
  if (!Number.isInteger(taskId) || taskId < 1) notFound();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return <TaskDetailOS sessionToken={sessionToken} taskId={taskId} />;
}
