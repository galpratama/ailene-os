"use client";

import type { DomainHistory, DomainOverview, RankPosition } from "@/apis/domain-ranking";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { compareDomains, getDomainHistory, getDomainOverview } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatRank, formatRankingDate, normalizeDomainLookup, RANKING_SOURCE_NAMES } from "@/lib/domain-ranking";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ExternalLink, Globe2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-xl border border-line bg-card-bg p-5"><p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">{label}</p><p className="mt-3 text-2xl font-bold tabular-nums text-gray-900 dark:text-zinc-100">{value}</p><p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">{note}</p></div>;
}

function ScoreHistory({ history }: { history: DomainHistory }) {
  if (history.composite.length === 0) return <p className="py-10 text-center text-sm text-gray-500">No composite history is available for this period.</p>;
  const points = history.composite.map((point) => ({ ...point, label: formatRankingDate(point.date) }));
  return <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}><defs><linearGradient id="domain-score-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--line-soft)" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} minTickGap={28} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)} / 100`, "Composite score"]} /><Area type="monotone" dataKey="score" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#domain-score-gradient)" dot={false} activeDot={{ r: 4 }} /></AreaChart></ResponsiveContainer></div>;
}

function RankHistory({ history }: { history: DomainHistory }) {
  const series = history.ranks.find((item) => item.points.length > 1);
  if (!series) return <p className="py-10 text-center text-sm text-gray-500">No rank history is available for this period.</p>;
  const points = series.points.map((point) => ({ label: formatRankingDate(point.date), value: point.rank ?? point.rank_bucket, bucket: point.rank_bucket !== null }));
  return <><p className="mb-3 text-xs text-gray-500 dark:text-zinc-400">{RANKING_SOURCE_NAMES[series.source]} · {series.country === "GLOBAL" ? "Worldwide" : series.country} · lower is better</p><div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}><defs><linearGradient id="domain-rank-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.2} /><stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--line-soft)" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} minTickGap={28} /><YAxis reversed tickLine={false} axisLine={false} tick={{ fill: "var(--foreground)", fontSize: 11 }} tickFormatter={(value: number) => value.toLocaleString("en-US")} /><Tooltip formatter={(value, _name, item) => [item.payload.bucket ? `Top ${Number(value).toLocaleString("en-US")}` : `#${Number(value).toLocaleString("en-US")}`, "Rank"]} /><Area type="stepAfter" dataKey="value" stroke="var(--chart-4)" strokeWidth={2.5} fill="url(#domain-rank-gradient)" connectNulls={false} dot={false} activeDot={{ r: 4 }} /></AreaChart></ResponsiveContainer></div></>;
}

function bestRank(overview: DomainOverview): RankPosition | null {
  return overview.ranks.reduce<RankPosition | null>((best, item) => {
    if (!best) return item;
    return (item.rank ?? item.rank_bucket ?? Infinity) < (best.rank ?? best.rank_bucket ?? Infinity) ? item : best;
  }, null);
}

export default function DomainRankingDetailPageOS({ domain, sessionToken }: { domain: string; sessionToken: string }) {
  const router = useRouter();
  const [lookup, setLookup] = useState("");
  const [peerInput, setPeerInput] = useState("");
  const [peerError, setPeerError] = useState("");
  const overview = useQuery({ queryKey: ["domain-ranking", "details", domain], queryFn: async () => requireApiData(await getDomainOverview(domain)), enabled: !!sessionToken });
  const history = useQuery({ queryKey: ["domain-ranking", "history", domain], queryFn: async () => requireApiData(await getDomainHistory(domain)), enabled: !!sessionToken && overview.data?.is_tracked === true });
  const comparison = useMutation({
    mutationFn: async (otherDomain: string) => requireApiData(await compareDomains([domain, otherDomain])),
    onError: (error) => showErrorToast(error, "Could not compare domains."),
  });

  function submitLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = normalizeDomainLookup(lookup);
    if (next) router.push(`/domain-ranking/${encodeURIComponent(next)}`);
  }

  function submitPeer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = normalizeDomainLookup(peerInput);
    if (!next) { setPeerError("Enter a domain to compare."); return; }
    if (next.toLowerCase().replace(/^www\./, "") === domain.toLowerCase().replace(/^www\./, "")) { setPeerError("Choose a different domain."); return; }
    setPeerError("");
    comparison.mutate(next);
  }

  const data = overview.data;
  const compared = comparison.data?.list ?? [];
  const comparisonRows = compared.length === 2 ? compared : [];

  return <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
    <div><AppButton href="/domain-ranking" variant="ghost" size="sm" className="-ml-3"><ArrowLeft size={14} /> Domain Ranking</AppButton></div>
    <PageHeaderOS title={data?.domain ?? domain} description="Website ranking, authority, and historical performance from public data sources."><AppButton href={`https://${data?.domain ?? domain}`} variant="outline" size="sm">Visit website <ExternalLink size={13} /></AppButton></PageHeaderOS>
    <form onSubmit={submitLookup} className="flex flex-col gap-2 sm:flex-row"><div className="min-w-0 flex-1"><AppInput inputId="detail-domain-lookup" icon={<Search size={15} />} value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Analyze another domain..." /></div><AppButton type="submit" disabled={!lookup.trim()}>Analyze <ArrowRight size={14} /></AppButton></form>
    {overview.isLoading && <p className="py-16 text-center text-sm text-gray-500">Loading domain analysis...</p>}
    {overview.isError && <div className="rounded-xl border border-line bg-card-bg p-6 text-sm text-merah">{overview.error.message}</div>}
    {data && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Composite score" value={data.composite ? `${data.composite.score.toFixed(1)} / 100` : "—"} note={data.composite ? `As of ${formatRankingDate(data.composite.date)}` : "No score available"} /><MetricCard label="Best reported rank" value={bestRank(data) ? formatRank(bestRank(data)!) : "—"} note="Across available lists" /><MetricCard label="Open PageRank" value={data.authority[0] ? `${data.authority[0].score.toFixed(1)} / 10` : "—"} note={data.authority[0] ? `As of ${formatRankingDate(data.authority[0].date)}` : "No authority score available"} /><MetricCard label="Tracked keywords" value={data.tracked_keywords.toLocaleString("en-US")} note={data.is_tracked ? "Tracked domain" : "No daily tracking"} /></div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"><section className="rounded-xl border border-line bg-card-bg p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Rankings by source</h3><span className="text-xs text-gray-400">Exact ranks and top-N bands</span></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-110 text-sm"><thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400"><th className="py-2 pr-3">Source</th><th className="py-2 pr-3">Market</th><th className="py-2 pr-3">Position</th><th className="py-2">As of</th></tr></thead><tbody>{data.ranks.map((item) => <tr key={`${item.source}-${item.country}`} className="border-b border-line-soft last:border-0"><td className="py-3 pr-3 font-medium text-gray-900 dark:text-zinc-100">{RANKING_SOURCE_NAMES[item.source]}</td><td className="py-3 pr-3 text-gray-500 dark:text-zinc-400">{item.country === "GLOBAL" ? "Worldwide" : item.country}</td><td className="py-3 pr-3 font-semibold tabular-nums text-claude dark:text-lime-bright">{formatRank(item)}</td><td className="py-3 text-gray-500 dark:text-zinc-400">{formatRankingDate(item.as_of_date)}</td></tr>)}</tbody></table>{data.ranks.length === 0 && <p className="py-8 text-center text-sm text-gray-500">This domain is not in a loaded ranking list.</p>}</div></section><section className="rounded-xl border border-line bg-card-bg p-5"><h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Domain profile</h3><div className="mt-4 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-claude/10 text-claude dark:bg-lime-bright/10 dark:text-lime-bright"><Globe2 size={20} /></span><div><p className="font-semibold text-gray-900 dark:text-zinc-100">{data.domain}</p><p className="text-xs text-gray-500 dark:text-zinc-400">{data.registrable_domain}</p></div></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between border-b border-line-soft pb-3"><dt className="text-gray-500 dark:text-zinc-400">Top-level domain</dt><dd className="font-medium text-gray-900 dark:text-zinc-100">.{data.tld}</dd></div><div className="flex justify-between border-b border-line-soft pb-3"><dt className="text-gray-500 dark:text-zinc-400">Daily history</dt><dd className="font-medium text-gray-900 dark:text-zinc-100">{data.is_tracked ? "Available" : "Not tracked"}</dd></div><div className="flex justify-between"><dt className="text-gray-500 dark:text-zinc-400">First seen</dt><dd className="font-medium text-gray-900 dark:text-zinc-100">{data.first_seen_at ? formatRankingDate(data.first_seen_at.slice(0, 10)) : "—"}</dd></div></dl></section></div>
      {data.is_tracked && <div className="grid gap-4 xl:grid-cols-2"><section className="rounded-xl border border-line bg-card-bg p-5"><h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Composite score history</h3><p className="mb-4 mt-1 text-xs text-gray-500 dark:text-zinc-400">Last 90 days · higher is better</p>{history.isLoading ? <p className="py-10 text-center text-sm text-gray-500">Loading history...</p> : history.isError ? <p className="py-10 text-center text-sm text-merah">{history.error.message}</p> : history.data ? <ScoreHistory history={history.data} /> : null}</section><section className="rounded-xl border border-line bg-card-bg p-5"><h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Rank history</h3><p className="mb-4 mt-1 text-xs text-gray-500 dark:text-zinc-400">Last 90 days · rank axis is inverted</p>{history.isLoading ? <p className="py-10 text-center text-sm text-gray-500">Loading history...</p> : history.isError ? <p className="py-10 text-center text-sm text-merah">{history.error.message}</p> : history.data ? <RankHistory history={history.data} /> : null}</section></div>}
      <section className="rounded-xl border border-line bg-card-bg p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Compare domains</h3><p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Compare scores and best positions side by side.</p></div><form onSubmit={submitPeer} className="flex flex-wrap items-start gap-2"><div className="w-52"><AppInput inputId="compare-domain" value={peerInput} onChange={(event) => { setPeerInput(event.target.value); setPeerError(""); }} placeholder="Competitor domain" errorMessage={peerError} /></div><AppButton type="submit" size="sm" className="h-9" disabled={comparison.isPending}>Compare</AppButton></form></div>{comparison.isPending && <p className="py-8 text-center text-sm text-gray-500">Comparing domains...</p>}{comparisonRows.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-130 text-sm"><thead><tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400"><th className="py-3 pr-4">Domain</th><th className="py-3 pr-4">Composite</th><th className="py-3 pr-4">Authority</th><th className="py-3 pr-4">Best position</th><th className="py-3">Keywords</th></tr></thead><tbody>{comparisonRows.map((item) => <tr key={item.domain} className="border-b border-line-soft last:border-0"><td className="py-3 pr-4 font-semibold text-gray-900 dark:text-zinc-100">{item.domain}</td><td className="py-3 pr-4 tabular-nums text-gray-600 dark:text-zinc-300">{item.overview?.composite ? `${item.overview.composite.score.toFixed(1)}/100` : "—"}</td><td className="py-3 pr-4 tabular-nums text-gray-600 dark:text-zinc-300">{item.overview?.authority[0] ? `${item.overview.authority[0].score.toFixed(1)}/10` : "—"}</td><td className="py-3 pr-4 tabular-nums text-gray-600 dark:text-zinc-300">{item.overview && bestRank(item.overview) ? formatRank(bestRank(item.overview)!) : "—"}</td><td className="py-3 tabular-nums text-gray-600 dark:text-zinc-300">{item.overview?.tracked_keywords ?? "—"}</td></tr>)}</tbody></table></div>}</section>
      <p className="text-xs text-gray-400 dark:text-zinc-500">These rankings and scores come from independent public sources. They do not represent Similarweb traffic estimates.</p>
    </>}
  </div>;
}
