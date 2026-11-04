"use client";

import WarehouseQuadrantChartOS, { type QuadrantPoint } from "@/components/charts/WarehouseQuadrantChartOS";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import WarehouseShareBarsOS from "@/components/charts/WarehouseShareBarsOS";
import WarehouseTrendChartOS from "@/components/charts/WarehouseTrendChartOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import AnalyticsKpiTileOS from "@/components/items/AnalyticsKpiTileOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { compact, decimal, integer, isComparable, rate, sumOf } from "@/lib/analytics-warehouse";
import { useMemo, useState } from "react";

function pagePath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

export default function AnalyticsSEOPanelOS() {
  const { data, activeFilters } = useAnalyticsView();
  const { current, previous, changes } = data.seo_summary;
  const comparable = isComparable(data, ["search_console"]);
  const [queryScope, setQueryScope] = useState<"non_branded" | "all">("non_branded");
  const [pageScope, setPageScope] = useState<"all" | "articles">("all");
  const [pageMetric, setPageMetric] = useState<"clicks" | "impressions">("impressions");
  const hasSearch = current.impressions > 0 || data.seo_daily.length > 0;
  const noDataMessage = activeFilters.channel ? "Search Console only describes organic search, so it is empty for any other channel filter. Choose Organic Search or All channels." : "No Search Console rows for this period. It publishes about two days late and starts on 23 Oct 2026.";

  const queries = useMemo(() => data.seo_queries.filter((row) => row.average_position !== null && (queryScope === "all" || !row.branded)), [data.seo_queries, queryScope]);
  const yMax = Math.ceil(Math.max(...queries.map((row) => row.impressions), 5) * 1.15);
  const xMax = Math.max(40, Math.ceil(Math.max(...queries.map((row) => row.average_position ?? 0), 0) / 10) * 10);
  const points: QuadrantPoint[] = queries.map((row) => ({
    key: row.query,
    label: row.query,
    x: row.average_position as number,
    y: row.impressions,
    z: Math.max(row.clicks, 1),
    emphasized: row.quick_win,
    rows: [
      { label: "avg position", value: decimal(row.average_position) },
      { label: "impressions", value: integer(row.impressions) },
      { label: "clicks", value: integer(row.clicks) },
      { label: "CTR", value: rate(row.ctr) },
    ],
    note: row.quick_win ? "Near page one. A small content or link push could bring real clicks." : undefined,
  }));
  const quickWins = queries.filter((row) => row.quick_win).sort((a, b) => b.impressions - a.impressions);

  const pages = useMemo(() => data.seo_pages.filter((row) => pageScope === "all" || pagePath(row.page).startsWith("/articles")).map((row) => ({ ...row, path: pagePath(row.page) })), [data.seo_pages, pageScope]);
  const topPages = [...pages].sort((a, b) => b[pageMetric] - a[pageMetric]).slice(0, 10);

  const branded = data.seo_branded.find((row) => row.segment === "branded");
  const nonBranded = data.seo_branded.find((row) => row.segment === "non_branded");
  const namedImpressions = (branded?.impressions ?? 0) + (nonBranded?.impressions ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AnalyticsKpiTileOS label="Clicks" info="Times someone clicked through from Google to the marketing site." value={integer(current.clicks)} change={changes.clicks} previous={integer(previous.clicks)} comparable={comparable} series={data.seo_daily.map((day) => day.clicks)} />
        <AnalyticsKpiTileOS label="Impressions" info="Times the site appeared in Google results, whether or not anyone clicked." value={compact(current.impressions)} change={changes.impressions} previous={compact(previous.impressions)} comparable={comparable} series={data.seo_daily.map((day) => day.impressions)} />
        <AnalyticsKpiTileOS label="CTR" info="Clicks divided by impressions. Low CTR with a good position usually means the title or description needs work." value={rate(current.ctr)} change={changes.ctr} previous={rate(previous.ctr)} comparable={comparable} series={data.seo_daily.map((day) => day.ctr)} />
        <AnalyticsKpiTileOS label="Average position" info="Average rank in Google, weighted by impressions. Lower is better: 1 is the top result, and page one ends around 10." value={decimal(current.average_position)} change={changes.average_position} previous={decimal(previous.average_position)} goodWhen="down" comparable={comparable} series={data.seo_daily.map((day) => (day.average_position === null ? null : -day.average_position))} />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <AnalyticsSectionOS
          className="xl:col-span-2"
          title="Search trend"
          question="Is organic visibility growing"
          info="Impressions usually move first, then clicks follow. The position axis is flipped so that higher on the chart means a better rank."
          datasets={["search_console"]}
          ignores={["campaign"]}
          emptyMessage={!hasSearch ? noDataMessage : null}
          table={{
            filename: "search-trend",
            rowKey: (row) => row.date,
            rows: data.seo_daily,
            columns: [
              { key: "date", label: "Date", value: (row) => row.date },
              { key: "clicks", label: "Clicks", align: "right", value: (row) => row.clicks },
              { key: "impressions", label: "Impressions", align: "right", value: (row) => row.impressions },
              { key: "ctr", label: "CTR", align: "right", value: (row) => row.ctr, render: (row) => rate(row.ctr) },
              { key: "position", label: "Avg position", align: "right", value: (row) => row.average_position, render: (row) => decimal(row.average_position) },
            ],
          }}
        >
          <div className="flex flex-col gap-3">
            <WarehouseTrendChartOS syncId="seo" label="Impressions" format={integer} formatTick={compact} kind="area" points={data.seo_daily.map((day) => ({ date: day.date, value: day.impressions }))} showDates={false} height={88} />
            <WarehouseTrendChartOS syncId="seo" label="Clicks" format={integer} color="var(--viz-2)" points={data.seo_daily.map((day) => ({ date: day.date, value: day.clicks }))} showDates={false} height={88} />
            <WarehouseTrendChartOS syncId="seo" label="Average position (higher on chart is better)" format={(value) => value.toFixed(1)} formatTick={(value) => value.toFixed(0)} kind="area" color="var(--viz-4)" reversed allowDecimals points={data.seo_daily.map((day) => ({ date: day.date, value: day.average_position }))} height={88} />
          </div>
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          className="xl:col-span-3"
          title="Quick-win map"
          question="Which searches are one push away from page one"
          info="Each dot is a search query. Left means a better rank and higher means more people searched it. The shaded band is positions 8 to 20: just around the bottom of page one, where a small improvement brings the most new clicks. Pick the highest dots inside it."
          datasets={["search_console"]}
          ignores={["campaign"]}
          takeaway={quickWins.length > 0 ? <><strong className="font-semibold">{quickWins.length} quick win{quickWins.length > 1 ? "s" : ""}.</strong> Start with &ldquo;{quickWins[0].query}&rdquo;: {integer(quickWins[0].impressions)} impressions at position {decimal(quickWins[0].average_position)}.</> : undefined}
          controls={<AnalyticsToggleOS label="Query scope" value={queryScope} onChange={setQueryScope} options={[{ value: "non_branded", label: "Non-branded" }, { value: "all", label: "All queries" }]} />}
          emptyMessage={!hasSearch ? noDataMessage : queries.length === 0 ? "No non-branded queries yet. Switch to All queries." : null}
          table={{
            filename: "search-queries",
            rowKey: (row) => row.query,
            rows: queries,
            columns: [
              { key: "query", label: "Query", value: (row) => row.query },
              { key: "clicks", label: "Clicks", align: "right", value: (row) => row.clicks },
              { key: "impressions", label: "Impressions", align: "right", value: (row) => row.impressions },
              { key: "ctr", label: "CTR", align: "right", value: (row) => row.ctr, render: (row) => rate(row.ctr) },
              { key: "position", label: "Avg position", align: "right", value: (row) => row.average_position, render: (row) => decimal(row.average_position) },
              { key: "quick", label: "Quick win", value: (row) => (row.quick_win ? "Yes" : "No") },
            ],
          }}
        >
          <WarehouseQuadrantChartOS
            points={points}
            xLabel="Average position (left is better)"
            yLabel="Impressions"
            formatX={(value) => value.toFixed(0)}
            formatY={compact}
            xDomain={[0, xMax]}
            yDomain={[0, yMax]}
            zone={{ x1: 8, x2: 20, y1: 0, y2: yMax, label: "Quick wins", labelPosition: "insideTop" }}
            bubbleRange={[60, 260]}
            height={320}
          />
        </AnalyticsSectionOS>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <AnalyticsSectionOS
          className="xl:col-span-2"
          title="Branded versus non-branded"
          question="Do people find you without already knowing you"
          info="Branded searches include your name, so those people already knew Ailene. Non-branded searches are genuinely new reach, and that share is what SEO work should grow. Google hides rare queries, so these totals are lower than page totals."
          datasets={["search_console"]}
          ignores={["campaign"]}
          takeaway={namedImpressions > 0 ? <><strong className="font-semibold">{rate((nonBranded?.impressions ?? 0) / namedImpressions, 0)}</strong> of named-query impressions come from people not searching your brand.</> : undefined}
          emptyMessage={namedImpressions === 0 ? noDataMessage : null}
        >
          <WarehouseShareBarsOS
            legend={[{ key: "Branded", color: "var(--viz-1)" }, { key: "Non-branded", color: "var(--viz-2)" }]}
            rows={(["impressions", "clicks"] as const).map((metric) => ({
              key: metric,
              label: metric === "impressions" ? "Impressions" : "Clicks",
              total: integer(sumOf(data.seo_branded, (row) => row[metric])),
              format: integer,
              segments: [
                { key: "Branded", value: branded?.[metric] ?? 0, color: "var(--viz-1)" },
                { key: "Non-branded", value: nonBranded?.[metric] ?? 0, color: "var(--viz-2)" },
              ],
            }))}
          />
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          className="xl:col-span-3"
          title="Top pages in search"
          question="Which pages and articles earn visibility"
          info="Pages ranked by the chosen measure. A page with many impressions but few clicks is seen and skipped, so improve its title. Use the Articles switch to review the blog on its own."
          datasets={["search_console"]}
          ignores={["campaign"]}
          controls={
            <>
              <AnalyticsToggleOS label="Page scope" value={pageScope} onChange={setPageScope} options={[{ value: "all", label: "All pages" }, { value: "articles", label: "Articles" }]} />
              <AnalyticsToggleOS label="Measure" value={pageMetric} onChange={setPageMetric} options={[{ value: "impressions", label: "Impressions" }, { value: "clicks", label: "Clicks" }]} />
            </>
          }
          emptyMessage={!hasSearch ? noDataMessage : pages.length === 0 ? "No articles appeared in search for this period." : null}
          table={{
            filename: "search-pages",
            rowKey: (row) => row.page,
            rows: pages,
            columns: [
              { key: "page", label: "Page", value: (row) => row.path },
              { key: "clicks", label: "Clicks", align: "right", value: (row) => row.clicks },
              { key: "impressions", label: "Impressions", align: "right", value: (row) => row.impressions },
              { key: "ctr", label: "CTR", align: "right", value: (row) => row.ctr, render: (row) => rate(row.ctr) },
              { key: "position", label: "Avg position", align: "right", value: (row) => row.average_position, render: (row) => decimal(row.average_position) },
            ],
          }}
        >
          <WarehouseRankedBarsOS
            items={topPages.map((row) => ({
              key: row.page,
              label: row.path,
              value: row[pageMetric],
              display: integer(row[pageMetric]),
              rows: [
                { label: "impressions", value: integer(row.impressions) },
                { label: "clicks", value: integer(row.clicks) },
                { label: "CTR", value: rate(row.ctr) },
                { label: "avg position", value: decimal(row.average_position) },
              ],
            }))}
          />
        </AnalyticsSectionOS>
      </div>
    </div>
  );
}
