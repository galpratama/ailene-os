import ClassMarketplaceOS from "@/components/pages/ClassMarketplaceOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return <ClassMarketplaceOS sessionToken={sessionToken} />;
}
