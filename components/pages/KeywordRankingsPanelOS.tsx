"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import RankingColumnHeaderOS from "@/components/navigations/RankingColumnHeaderOS";
import { listKeywordRankings } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatRankingDate } from "@/lib/domain-ranking";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_SIZE = 20;

export default function KeywordRankingsPanelOS({ sessionToken }: { sessionToken: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ["domain-ranking", "keywords", search, page],
    queryFn: async () => requireApiData(await listKeywordRankings({
      q: search || undefined, sort: "keyword", page, page_size: PAGE_SIZE,
    })),
    enabled: !!sessionToken,
  });

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Google keyword rankings</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Compare the latest Google position of domains tracked for each keyword.</p>
        </div>
        <div className="w-full sm:w-64"><AppInput inputId="ranking-keyword-search" aria-label="Search keywords" placeholder="Search keywords" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-175 text-sm">
          <thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
            <th className="px-5 py-3">Keyword</th>
            <th className="px-5 py-3">Market</th>
            <RankingColumnHeaderOS className="px-5 py-3" explanation="The latest Google result position for each tracked domain, from 1 to 100. Lower is better. A dash means it has not ranked in the checked results.">Domain positions</RankingColumnHeaderOS>
            <th className="px-5 py-3">Last checked</th>
          </tr></thead>
          <tbody>{result.data?.list.map((row) => (
            <tr key={row.id} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
              <td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{row.keyword}</td>
              <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{row.country} · {row.language}</td>
              <td className="px-5 py-3"><div className="flex flex-wrap gap-2">{row.domains.map((entry) => (
                <Link key={entry.domain} href={`/domain-ranking/${encodeURIComponent(entry.domain)}`} className="inline-flex items-center gap-2 rounded-lg border border-line-soft px-2.5 py-1.5 text-gray-700 hover:border-claude dark:text-zinc-200 dark:hover:border-lime-bright">
                  <span>{entry.domain}</span><span className="font-bold tabular-nums text-claude dark:text-lime-bright">{entry.position == null ? "—" : `#${entry.position}`}</span>
                </Link>
              ))}</div></td>
              <td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{formatRankingDate(row.domains.reduce<string | null>((latest, entry) => entry.date && (!latest || entry.date > latest) ? entry.date : latest, null))}</td>
            </tr>
          ))}</tbody>
        </table>
        {result.isLoading && <p className="py-10 text-center text-sm text-gray-500">Loading keyword rankings...</p>}
        {result.isError && <p className="py-10 text-center text-sm text-merah">{result.error.message}</p>}
        {result.isSuccess && result.data.list.length === 0 && <p className="py-10 text-center text-sm text-gray-500">No tracked keywords match this search.</p>}
      </div>
      {(result.data?.metapaging.total_page ?? 0) > 1 && <div className="flex items-center justify-between gap-3 border-t border-line-soft px-5 py-3 text-xs text-gray-500 dark:text-zinc-400">
        <span>Page {page} of {result.data?.metapaging.total_page}</span>
        <div className="flex gap-2"><AppButton variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /> Previous</AppButton><AppButton variant="outline" size="sm" disabled={page >= (result.data?.metapaging.total_page ?? 1)} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={14} /></AppButton></div>
      </div>}
    </section>
  );
}
