import PricingCalculatorPageOS from "@/components/pages/PricingCalculatorPageOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { parsePricingPipelineId } from "@/lib/quotation-navigation";
import { cookies } from "next/headers";

export default async function Page({ searchParams }: {
  searchParams: Promise<{ pipeline_id?: string | string[] }>;
}) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";
  const initialPipelineId = parsePricingPipelineId(params.pipeline_id);

  return <PricingCalculatorPageOS key={initialPipelineId ?? "unlinked"} sessionToken={sessionToken} initialPipelineId={initialPipelineId} />;
}
