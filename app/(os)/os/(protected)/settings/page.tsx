import { listTeams } from "@/apis/teams";
import SettingsPageOS from "@/components/pages/SettingsPageOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";
  const teams = await listTeams();

  return (
    <SettingsPageOS sessionToken={sessionToken} teams={teams.data?.list ?? []} />
  );
}
