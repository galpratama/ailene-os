"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import Label from "@/components/labels/Label";
import TrendingKindLabel from "@/components/labels/TrendingKindLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type { TrendingKeywordData, TrendingKeywordKind } from "@/apis/trending-keywords";
import { useSession } from "@/contexts/SessionContext";
import { listTrendingKeywords, refreshTrendingKeywords } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { TRENDING_SEED_OPTIONS, formatCaptureDate } from "@/lib/trending-keywords";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, CalendarDays, RefreshCw, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 50;

const kindTabs: { value: TrendingKeywordKind | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "rising", label: "Rising" },
  { value: "top", label: "Top" },
];

function ScoreCell({ row }: { row: TrendingKeywordData }) {
  if (row.kind === "top") {
    return (
      <div className="flex items-center gap-2.5">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-claude" style={{ width: `${row.score}%` }} />
        </div>
        <span className="w-7 text-right font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
          {row.score_label}
        </span>
      </div>
    );
  }
  if (row.score_label.toLowerCase() === "breakout") {
    return (
      <Label variant="merah">
        <Zap size={12} />
        Breakout
      </Label>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-hijau tabular-nums">
      <ArrowUp size={13} />
      {row.score_label.replace(/^\+/, "")}
    </span>
  );
}

export default function TrendingKeywordsPageOS({ sessionToken }: { sessionToken: string }) {
  const queryClient = useQueryClient();
  const isAdmin = useSession()?.role === "ADMINISTRATOR";

  const [capturedOn, setCapturedOn] = useState("");
  const [seed, setSeed] = useState("");
  const [kind, setKind] = useState<TrendingKeywordKind | "">("");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const filters = {
    captured_on: capturedOn || undefined,
    seed_keyword: seed || undefined,
    kind: kind || undefined,
    keyword: keyword || undefined,
    page,
    page_size: PAGE_SIZE,
  };

  const query = useQuery({
    queryKey: ["trending-keywords", filters],
    queryFn: async () => requireApiData(await listTrendingKeywords(filters)),
    enabled: !!sessionToken,
    placeholderData: keepPreviousData,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => requireApiData(await refreshTrendingKeywords()),
    onSuccess: async (result) => {
      toast.success(`Captured ${result.keyword_count} keywords for ${formatCaptureDate(result.captured_on)}.`);
      if (result.failed_seeds.length > 0) {
        toast.warning(`Could not load: ${result.failed_seeds.join(", ")}. Their earlier rows were kept.`);
      }
      setCapturedOn("");
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["trending-keywords"] });
    },
    onError: (error) => showErrorToast(error, "Failed to refresh trending keywords."),
  });

  const rows = query.data?.list ?? [];
  const metapaging = query.data?.metapaging;
  const shownDate = rows[0]?.captured_on ?? (capturedOn || null);
  const hasFilters = !!(seed || kind || keyword);

  function changeFilter(apply: () => void) {
    apply();
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Keywords"
        description="Search queries around AI training that are trending on Google in Indonesia, captured daily at 06:00 WIB."
      >
        {isAdmin && (
          <AppButton
            variant="outline"
            size="sm"
            title="Capture today's keywords now (uses SerpApi quota)"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw size={13} className={refreshMutation.isPending ? "animate-spin" : ""} />
            {refreshMutation.isPending ? "Refreshing..." : "Refresh now"}
          </AppButton>
        )}
      </PageHeaderOS>

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="keywords-search"
          icon={<Search size={14} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search keywords..."
          className="max-w-full sm:max-w-xs"
        />
        <div className="w-full max-w-48">
          <AppSelect
            selectId="keywords-seed-filter"
            placeholder="All seeds"
            value={seed}
            options={TRENDING_SEED_OPTIONS}
            onChange={(value) => changeFilter(() => setSeed((value as string) ?? ""))}
          />
        </div>
        <div className="w-full max-w-44">
          <AppInput
            inputId="keywords-date"
            type="date"
            icon={<CalendarDays size={14} />}
            value={capturedOn}
            onChange={(event) => changeFilter(() => setCapturedOn(event.target.value))}
          />
        </div>
        {capturedOn && (
          <AppButton variant="ghost" size="sm" onClick={() => changeFilter(() => setCapturedOn(""))}>
            Latest
          </AppButton>
        )}
        {/* Segmented toggle, not a button in the AppButton sense. */}
        <div className="flex rounded-lg border border-line bg-gray-50 p-0.5 dark:bg-zinc-800">
          {kindTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => changeFilter(() => setKind(tab.value))}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                kind === tab.value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-zinc-400">
        {shownDate ? (
          <span>
            Capture of <span className="font-semibold text-gray-900 dark:text-zinc-100">{formatCaptureDate(shownDate)}</span>
            {!capturedOn && " (latest)"}
          </span>
        ) : (
          query.isSuccess && <span>No capture yet.</span>
        )}
        {metapaging && metapaging.total_data > 0 && <span>· {metapaging.total_data} keywords</span>}
        <span className="text-xs text-gray-400">
          Rising = growth over the past 7 days · Top = relative search interest (100 = most searched)
        </span>
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-line bg-card-bg ${query.isFetching && !query.isLoading ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="w-16 px-5 py-3">Rank</th>
                <th className="px-5 py-3">Keyword</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Seed</th>
                <th className="px-5 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3 font-semibold tabular-nums text-gray-400">#{row.rank}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{row.keyword}</td>
                  <td className="px-5 py-3">
                    <TrendingKindLabel kind={row.kind} />
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">{row.seed_keyword}</td>
                  <td className="px-5 py-3">
                    <ScoreCell row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.isLoading && (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">Loading keywords...</p>
          )}
          {query.isError && (
            <p className="py-10 text-center text-sm text-merah">{query.error.message}</p>
          )}
          {query.isSuccess && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">
              {hasFilters
                ? "No keywords match these filters."
                : capturedOn
                  ? "Nothing was captured on this day."
                  : isAdmin
                    ? 'No keywords captured yet. Use "Refresh now" to capture today\'s.'
                    : "No keywords captured yet."}
            </p>
          )}
        </div>
      </div>

      <AppPaginationOS
        currentPage={page}
        totalPages={metapaging?.total_page ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
