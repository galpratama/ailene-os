import { listTeams } from "@/apis/teams";
import { listUsers, type UserStatus } from "@/apis/users";
import { isSuccessStatus } from "@/lib/status_code";
import UsersAccessPageOS from "@/components/pages/UsersAccessPageOS";

const PAGE_SIZE = 20;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    keyword?: string;
    team?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const keyword = params.keyword?.trim() ?? "";
  const team = params.team ?? "";
  const status = params.status ?? "";
  const page = Number(params.page ?? "1") || 1;

  const [users, teams] = await Promise.all([
    listUsers({
      page,
      page_size: PAGE_SIZE,
      keyword: keyword || undefined,
      team_id: team ? Number(team) : undefined,
      status: (status || undefined) as UserStatus | undefined,
    }),
    listTeams(),
  ]);

  return (
    <UsersAccessPageOS
      users={users.data?.list ?? []}
      page={page}
      totalPages={users.data?.metapaging.total_page ?? 1}
      teams={teams.data?.list ?? []}
      loadError={
        isSuccessStatus(users.status)
          ? null
          : (users.message ?? "Failed to load users.")
      }
      initialKeyword={keyword}
      initialTeam={team}
      initialStatus={status}
    />
  );
}
