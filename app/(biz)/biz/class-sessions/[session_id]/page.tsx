import ClassSessionApplyPageBIZ from "@/components/pages/ClassSessionApplyPageBIZ";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Apply ke Sesi Kelas · Ailene",
  description: "Apply sebagai trainer untuk sesi kelas B2B Ailene ini.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;
  const sessionId = Number(session_id);
  if (!Number.isInteger(sessionId)) {
    notFound();
  }

  return <ClassSessionApplyPageBIZ sessionId={sessionId} />;
}
