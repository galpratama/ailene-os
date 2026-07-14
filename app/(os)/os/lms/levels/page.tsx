import LmsLevelListOS from "@/components/pages/LmsLevelListOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return <LmsLevelListOS sessionToken={sessionToken} />;
}
