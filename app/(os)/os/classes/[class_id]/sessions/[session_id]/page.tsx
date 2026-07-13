import B2BClassSessionDetailOS from "@/components/pages/B2BClassSessionDetailOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ class_id: string; session_id: string }>;
}) {
  const { class_id, session_id } = await params;
  const classId = Number(class_id);
  const sessionId = Number(session_id);
  if (!Number.isInteger(classId) || !Number.isInteger(sessionId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return (
    <B2BClassSessionDetailOS
      sessionToken={sessionToken}
      classId={classId}
      sessionId={sessionId}
    />
  );
}
