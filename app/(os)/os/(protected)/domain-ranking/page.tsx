import DomainRankingPageOS from "@/components/pages/DomainRankingPageOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

export default async function Page() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? "";
  return <DomainRankingPageOS sessionToken={sessionToken} />;
}
