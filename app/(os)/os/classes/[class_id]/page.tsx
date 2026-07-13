import B2BClassDetailOS from "@/components/pages/B2BClassDetailOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ class_id: string }>;
}) {
  const { class_id } = await params;
  const classId = Number(class_id);
  if (!Number.isInteger(classId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return <B2BClassDetailOS sessionToken={sessionToken} classId={classId} />;
}
