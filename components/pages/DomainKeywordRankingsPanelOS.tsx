"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import RankingColumnHeaderOS from "@/components/navigations/RankingColumnHeaderOS";
import { listDomainKeywordRankings } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatRankingDate } from "@/lib/domain-ranking";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 20;

export default function DomainKeywordRankingsPanelOS({ domain, sessionToken }: { domain: string; sessionToken: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ["domain-ranking", "domain-keywords", domain, search, page],
    queryFn: async () => requireApiData(await listDomainKeywordRankings({
      domain, q: search || undefined, sort: "position", page, page_size: PAGE_SIZE,
    })),
    enabled: !!sessionToken,
  });

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Google rank by keyword</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Latest checked position in the top 100 Google results.</p>
        </div>
        <div className="w-full sm:w-56">
          <AppInput inputId="domain-keyword-search" aria-label="Search tracked keywords" placeholder="Search keywords" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-sm">
          <thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
            <th className="px-5 py-3">Keyword</th>
            <th className="px-5 py-3">Market</th>
            <RankingColumnHeaderOS className="px-5 py-3" explanation="Position in Google results at the latest check. A smaller number is better; a dash means the domain was outside the top 100 or has not been checked.">Position</RankingColumnHeaderOS>
            <RankingColumnHeaderOS className="px-5 py-3" explanation="Previous Google position minus current position. A positive number means the domain moved up.">Change</RankingColumnHeaderOS>
            <th className="px-5 py-3">Checked</th>
          </tr></thead>
          <tbody>{result.data?.list.map((row) => (
            <tr key={row.keyword_id} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
              <td className="px-5 py-3 font-medium text-gray-900 dark:text-zinc-100">{row.keyword}</td>
              <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{row.country} · {row.language}</td>
              <td className="px-5 py-3 font-semibold tabular-nums text-claude dark:text-lime-bright">{row.position == null ? "—" : `#${row.position}`}</td>
              <td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">{row.change == null ? "—" : row.change > 0 ? `↑ ${row.change}` : row.change < 0 ? `↓ ${Math.abs(row.change)}` : "0"}</td>
              <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{formatRankingDate(row.date)}</td>
            </tr>
          ))}</tbody>
        </table>
        {result.isLoading && <p className="py-10 text-center text-sm text-gray-500">Loading keyword positions...</p>}
        {result.isError && <p className="py-10 text-center text-sm text-merah">{result.error.message}</p>}
        {result.isSuccess && result.data.list.length === 0 && <p className="py-10 text-center text-sm text-gray-500">No tracked keywords for this domain.</p>}
      </div>
      {(result.data?.metapaging.total_page ?? 0) > 1 && <div className="flex items-center justify-between gap-3 border-t border-line-soft px-5 py-3 text-xs text-gray-500 dark:text-zinc-400">
        <span>Page {page} of {result.data?.metapaging.total_page}</span>
        <div className="flex gap-2"><AppButton variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /> Previous</AppButton><AppButton variant="outline" size="sm" disabled={page >= (result.data?.metapaging.total_page ?? 1)} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={14} /></AppButton></div>
      </div>}
    </section>
  );
}
