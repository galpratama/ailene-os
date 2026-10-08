import DomainRankingDetailPageOS from "@/components/pages/DomainRankingDetailPageOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? "";
  return <DomainRankingDetailPageOS domain={domain} sessionToken={sessionToken} />;
}
