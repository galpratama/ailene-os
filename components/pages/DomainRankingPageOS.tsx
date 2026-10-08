"use client";

import type { RankingSource, TrackedOptions } from "@/apis/domain-ranking";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import RankingColumnHeaderOS from "@/components/navigations/RankingColumnHeaderOS";
import KeywordRankingsPanelOS from "@/components/pages/KeywordRankingsPanelOS";
import TrackDomainFormOS from "@/components/pages/TrackDomainFormOS";
import { listDomainRankings, listRankingSources, listTrackedDomains } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatRank, formatRankingDate, normalizeDomainLookup, RANKING_SOURCE_NAMES } from "@/lib/domain-ranking";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Globe2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 50;
type View = "ranking" | "tracked" | "keywords";

function DomainLink({ domain }: { domain: string }) {
  return (
    <Link href={`/domain-ranking/${encodeURIComponent(domain)}`} className="group inline-flex items-center gap-3 font-semibold text-gray-900 hover:text-claude dark:text-zinc-100 dark:hover:text-lime-bright">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-claude/10 text-claude dark:bg-lime-bright/10 dark:text-lime-bright"><Globe2 size={16} /></span>
      <span className="truncate">{domain}</span>
      <ArrowRight size={13} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

export default function DomainRankingPageOS({ sessionToken }: { sessionToken: string }) {
  const router = useRouter();
  const [view, setView] = useState<View>("tracked");
  const [source, setSource] = useState<RankingSource>("radar");
  const [country, setCountry] = useState("ID");
  const [search, setSearch] = useState("");
  const [queryText, setQueryText] = useState("");
  const [tld, setTld] = useState("");
  const [cursors, setCursors] = useState<string[]>([""]);
  const [trackedPage, setTrackedPage] = useState(1);
  const [trackedSort, setTrackedSort] = useState<NonNullable<TrackedOptions["sort"]>>("composite");

  useEffect(() => {
    const timer = setTimeout(() => setQueryText(normalizeDomainLookup(search)), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const sources = useQuery({
    queryKey: ["domain-ranking", "sources"],
    queryFn: async () => requireApiData(await listRankingSources()),
    enabled: !!sessionToken && view === "ranking",
  });
  const rankSources = sources.data?.list.filter((item) => item.kind !== "score" && item.lists.length > 0) ?? [];
  const currentSource = rankSources.find((item) => item.id === source) ?? rankSources.find((item) => item.id === "radar") ?? rankSources[0];
  const effectiveSource = currentSource?.id as RankingSource | undefined;
  const availableCountries = currentSource?.lists.map((item) => item.country) ?? [];
  const effectiveCountry = availableCountries.includes(country) ? country : (availableCountries.includes("ID") ? "ID" : availableCountries[0]);

  const cursor = cursors[cursors.length - 1];
  const ranking = useQuery({
    queryKey: ["domain-ranking", "rankings", effectiveSource, effectiveCountry, queryText, tld, cursor],
    queryFn: async () => requireApiData(await listDomainRankings({
      source: effectiveSource!, country: effectiveCountry, q: queryText || undefined, tld: tld || undefined,
      limit: PAGE_SIZE, cursor: cursor || undefined,
    })),
    enabled: !!sessionToken && view === "ranking" && !!currentSource && !!effectiveCountry,
  });
  const tracked = useQuery({
    queryKey: ["domain-ranking", "tracked", queryText, tld, trackedSort, trackedPage],
    queryFn: async () => requireApiData(await listTrackedDomains({
      q: queryText || undefined, tld: tld || undefined, sort: trackedSort,
      page: trackedPage, page_size: PAGE_SIZE,
    })),
    enabled: !!sessionToken && view === "tracked",
  });

  function resetPages() {
    setCursors([""]);
    setTrackedPage(1);
  }

  function changeSource(value: RankingSource) {
    setSource(value);
    const item = rankSources.find((entry) => entry.id === value);
    setCountry(item?.lists.find((entry) => entry.country === country)?.country ?? item?.lists[0]?.country ?? "GLOBAL");
    resetPages();
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS title="Domain Ranking" description="Rank and compare the domains your team tracks." />

      <div className="rounded-2xl border border-line bg-card-bg p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-claude dark:text-lime-bright">Website intelligence</p>
            <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-zinc-100">Explore tracked domains</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-zinc-400">See each domain&apos;s composite rank, authority and source positions. Select a domain for its scores and history.</p>
          </div>
          <span className="rounded-full bg-claude/10 px-3 py-1 text-xs font-semibold text-claude dark:bg-lime-bright/10 dark:text-lime-bright">Public data</span>
        </div>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const value = normalizeDomainLookup(search); if (value) router.push(`/domain-ranking/${encodeURIComponent(value)}`); }}>
          <div className="min-w-0 flex-1"><AppInput inputId="domain-lookup" icon={<Search size={15} />} value={search} onChange={(event) => { setSearch(event.target.value); resetPages(); }} placeholder="Search a domain or enter a website URL..." /></div>
          <AppButton type="submit" size="md" disabled={!search.trim()}>Analyze domain <ArrowRight size={15} /></AppButton>
        </form>
      </div>

      <TrackDomainFormOS />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft">
        <div className="flex gap-5">
          {([ ["tracked", "Tracked domains"], ["keywords", "Keyword rankings"], ["ranking", "Top websites"] ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setView(value)} className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${view === value ? "border-claude text-claude dark:border-lime-bright dark:text-lime-bright" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400"}`}>{label}</button>
          ))}
        </div>
        <p className="pb-3 text-xs text-gray-400 dark:text-zinc-500">{view === "tracked" ? "Composite rank across all tracked domains" : view === "keywords" ? "Google positions for tracked keywords" : "Explore public source rankings"}</p>
      </div>

      {view === "keywords" && <KeywordRankingsPanelOS sessionToken={sessionToken} />}

      {view === "ranking" && sources.isError && <div className="rounded-xl border border-line bg-card-bg p-6 text-sm text-merah">{sources.error.message}</div>}
      {view === "ranking" && sources.isLoading && <p className="py-10 text-center text-sm text-gray-500">Loading ranking sources...</p>}

      {view === "ranking" && sources.isSuccess && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-52"><AppSelect selectId="ranking-source" label="Data source" placeholder="Select source" value={effectiveSource ?? null} options={rankSources.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => changeSource(value as RankingSource)} /></div>
            <div className="w-full sm:w-44"><AppSelect selectId="ranking-country" label="Country" placeholder="Select country" value={effectiveCountry ?? null} options={availableCountries.map((value) => ({ value, label: value === "GLOBAL" ? "Worldwide" : value === "ID" ? "Indonesia" : value }))} onChange={(value) => { setCountry(String(value)); resetPages(); }} /></div>
            <div className="w-full sm:w-32"><AppInput inputId="ranking-tld" label="Domain suffix" value={tld} onChange={(event) => { setTld(event.target.value.trim().replace(/^\./, "")); resetPages(); }} placeholder="e.g. id" /></div>
            {currentSource && <div className="pb-1 text-xs text-gray-500 dark:text-zinc-400">As of <span className="font-semibold text-gray-700 dark:text-zinc-200">{formatRankingDate(ranking.data?.as_of_date ?? currentSource.lists.find((item) => item.country === effectiveCountry)?.as_of_date ?? null)}</span><a className="ml-2 inline-flex items-center gap-1 text-claude hover:underline dark:text-lime-bright" href={currentSource.url} target="_blank" rel="noopener noreferrer">Source <ExternalLink size={11} /></a></div>}
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card-bg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-sm">
                <thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400"><RankingColumnHeaderOS className="w-42 px-5 py-3" explanation="Position in the selected public source. Exact ranks start with #; Top N is a popularity band, not an exact position. Lower is better.">Rank</RankingColumnHeaderOS><th className="px-5 py-3">Website</th><th className="w-44 px-5 py-3">Coverage</th><th className="w-32 px-5 py-3">Data date</th></tr></thead>
                <tbody>{ranking.data?.list.map((row) => <tr key={row.domain} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"><td className="px-5 py-3 font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{formatRank(row)}</td><td className="px-5 py-3"><DomainLink domain={row.domain} /></td><td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{effectiveCountry === "GLOBAL" ? "Worldwide" : effectiveCountry}</td><td className="px-5 py-3 text-gray-500 dark:text-zinc-400">{formatRankingDate(ranking.data?.as_of_date ?? null)}</td></tr>)}</tbody>
              </table>
              {ranking.isLoading && <p className="py-12 text-center text-sm text-gray-500">Loading websites...</p>}
              {ranking.isError && <p className="py-12 text-center text-sm text-merah">{ranking.error.message}</p>}
              {ranking.isSuccess && ranking.data.list.length === 0 && <p className="py-12 text-center text-sm text-gray-500">No domains match these filters, or this list has not been loaded yet.</p>}
              {rankSources.length === 0 && <p className="py-12 text-center text-sm text-gray-500">No ranking lists have been loaded yet.</p>}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400"><span>Page {cursors.length} · Up to {PAGE_SIZE} domains per page</span><div className="flex gap-2"><AppButton variant="outline" size="sm" disabled={cursors.length === 1} onClick={() => setCursors((items) => items.slice(0, -1))}><ChevronLeft size={14} /> Previous</AppButton><AppButton variant="outline" size="sm" disabled={!ranking.data?.next_cursor || ranking.isFetching} onClick={() => setCursors((items) => [...items, ranking.data!.next_cursor!])}>Next <ChevronRight size={14} /></AppButton></div></div>
        </>
      )}

      {view === "tracked" && (
        <>
          <div className="flex flex-wrap items-end gap-3"><div className="w-full sm:w-40"><AppInput inputId="tracked-tld" label="Domain suffix" value={tld} onChange={(event) => { setTld(event.target.value.trim().replace(/^\./, "")); resetPages(); }} placeholder="e.g. id" /></div><div className="w-full sm:w-48"><AppSelect selectId="tracked-sort" label="Sort by" placeholder="Sort" value={trackedSort} options={[{ value: "composite", label: "Composite score" }, { value: "authority", label: "Authority score" }, { value: "tranco", label: "Tranco rank" }, { value: "crux", label: "CrUX band" }, { value: "domain", label: "Domain A–Z" }, { value: "newest", label: "Newest" }]} onChange={(value) => { setTrackedSort(value as NonNullable<TrackedOptions["sort"]>); setTrackedPage(1); }} /></div><p className="pb-1 text-xs text-gray-500 dark:text-zinc-400">{tracked.data?.metapaging.total_data.toLocaleString("en-US") ?? "—"} tracked domains</p></div>
          <div className="overflow-hidden rounded-xl border border-line bg-card-bg"><div className="overflow-x-auto"><table className="w-full min-w-180 text-sm"><thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400"><RankingColumnHeaderOS className="w-24 px-5 py-3" explanation="Position among all tracked domains by their latest composite score. Equal scores share a rank; domains without a score have no rank.">Rank</RankingColumnHeaderOS><th className="px-5 py-3">Website</th><RankingColumnHeaderOS className="px-5 py-3" explanation="Score from 0 to 100 combining Tranco (35%), CrUX (25%), Cloudflare Radar (20%), and Open PageRank (20%). Available weights are normalized when a source is missing. Higher is better; a dash means no source has a value yet.">Composite</RankingColumnHeaderOS><RankingColumnHeaderOS className="px-5 py-3" explanation="Open PageRank authority score from 0 to 10. It estimates link-based website authority; higher is better. A dash means Open PageRank has no score for the domain.">Authority</RankingColumnHeaderOS><RankingColumnHeaderOS className="px-5 py-3" explanation="Worldwide position in the Tranco top one million website list. Lower is better; a dash means the domain is outside the loaded list.">Tranco</RankingColumnHeaderOS><RankingColumnHeaderOS className="px-5 py-3" explanation="Chrome UX Report popularity band for Indonesia based on Chrome usage. Top N is a band, not an exact rank; lower is better.">CrUX · ID</RankingColumnHeaderOS><RankingColumnHeaderOS className="px-5 py-3" explanation="Number of Google search queries tracked for this domain. See Keyword rankings for their latest positions.">Keywords</RankingColumnHeaderOS></tr></thead><tbody>{tracked.data?.list.map((row) => <tr key={row.domain} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"><td className="px-5 py-3 font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{row.tracked_rank == null ? "—" : `#${row.tracked_rank.toLocaleString("en-US")}`}</td><td className="px-5 py-3"><DomainLink domain={row.domain} /></td><td className="px-5 py-3 font-semibold tabular-nums text-claude dark:text-lime-bright">{row.composite_score === null ? "—" : `${row.composite_score.toFixed(1)}/100`}</td><td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">{row.authority_score === null ? "—" : `${row.authority_score.toFixed(1)}/10`}</td><td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">{row.tranco_rank === null ? "—" : `#${row.tranco_rank.toLocaleString("en-US")}`}</td><td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">{row.crux_bucket === null ? "—" : `Top ${row.crux_bucket.toLocaleString("en-US")}`}</td><td className="px-5 py-3 tabular-nums text-gray-600 dark:text-zinc-300">{row.tracked_keywords}</td></tr>)}</tbody></table>{tracked.isLoading && <p className="py-12 text-center text-sm text-gray-500">Loading tracked domains...</p>}{tracked.isError && <p className="py-12 text-center text-sm text-merah">{tracked.error.message}</p>}{tracked.isSuccess && tracked.data.list.length === 0 && <p className="py-12 text-center text-sm text-gray-500">No tracked domains match these filters.</p>}</div></div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400"><span>Page {trackedPage} of {tracked.data?.metapaging.total_page ?? 1}</span><div className="flex gap-2"><AppButton variant="outline" size="sm" disabled={trackedPage <= 1} onClick={() => setTrackedPage((page) => page - 1)}><ChevronLeft size={14} /> Previous</AppButton><AppButton variant="outline" size="sm" disabled={trackedPage >= (tracked.data?.metapaging.total_page ?? 1)} onClick={() => setTrackedPage((page) => page + 1)}>Next <ChevronRight size={14} /></AppButton></div></div>
        </>
      )}
      {view !== "keywords" && <p className="text-xs text-gray-400 dark:text-zinc-500">{view === "tracked" ? "Tracked rank uses the latest composite score across all tracked domains. Domains without a score have no tracked rank. Tranco and CrUX show separate source positions." : <>Rankings represent source specific positions or popularity bands, not traffic or visit estimates. <span className="font-medium">{RANKING_SOURCE_NAMES[effectiveSource ?? source]}</span> data is shown with its original attribution.</>}</p>}
    </div>
  );
}
