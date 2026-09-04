import QuotationEditPageOS from "@/components/pages/QuotationEditPageOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ quotation_id: string }>;
}) {
  const { quotation_id } = await params;
  const quotationId = Number(quotation_id);
  if (!Number.isInteger(quotationId) || quotationId < 1) notFound();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return (
    <QuotationEditPageOS sessionToken={sessionToken} quotationId={quotationId} />
  );
}
