"use client";

import type { WarehouseAd } from "@/apis/analytics";
import WarehouseDumbbellOS from "@/components/charts/WarehouseDumbbellOS";
import WarehouseQuadrantChartOS, { type QuadrantPoint } from "@/components/charts/WarehouseQuadrantChartOS";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import AdThumbnailOS from "@/components/elements/AdThumbnailOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsStatStripOS from "@/components/elements/AnalyticsStatStripOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { decimal, funnelValue, integer, money, moneyOrDash, rate, sumOf } from "@/lib/analytics-warehouse";
import { useMemo, useState } from "react";

const MIN_TRAFFIC = 20;
// A page within this margin of the average is not a finding, especially when one page sets the average itself.
const CLEAR_GAP = 0.03;

function destinationGroups(ads: WarehouseAd[]) {
  const groups = new Map<string, { title: string; hint: string; ads: WarehouseAd[] }>();
  for (const ad of ads) {
    if (ad.spend_idr <= 0) continue;
    const key = ad.destination_kind === "landing_page" ? (ad.destination_path ?? "/") : ad.destination_kind;
    const entry = groups.get(key) ?? (
      ad.destination_kind === "instant_form"
        ? { title: "Meta Instant Form", hint: "The form opens inside Facebook or Instagram, so these people never visit the site.", ads: [] }
        : ad.destination_kind === "landing_page"
          ? { title: `Landing page ${key}`, hint: "These ads send people to the website.", ads: [] }
          : { title: "Unknown destination", hint: "Meta returned no destination URL for these ads.", ads: [] }
    );
    entry.ads.push(ad);
    groups.set(key, entry);
  }
  return [...groups.values()].sort((a, b) => sumOf(b.ads, (ad) => ad.spend_idr) - sumOf(a.ads, (ad) => ad.spend_idr));
}

export default function AnalyticsLandingPagePanelOS() {
  const { data } = useAnalyticsView();
  const [minSessions, setMinSessions] = useState<"1" | "5" | "20">("5");
  const pages = useMemo(() => data.landing_pages.filter((page) => page.landing_page !== "(not set)"), [data.landing_pages]);
  const totalSessions = sumOf(data.landing_pages, (page) => page.sessions);
  const hasKeyEvents = pages.some((page) => page.key_events > 0);
  const [metricChoice, setMetricChoice] = useState<"engaged" | "conversion">("engaged");
  const metric = hasKeyEvents ? metricChoice : "engaged";
  const valueOf = (page: (typeof pages)[number]) => (metric === "engaged" ? page.engaged_rate : page.conversion_rate) ?? 0;

  const benchmark = useMemo(() => {
    const engaged = sumOf(pages, (page) => (page.engaged_rate ?? 0) * page.sessions);
    const keyEvents = sumOf(pages, (page) => page.key_events);
    const sessions = Math.max(sumOf(pages, (page) => page.sessions), 1);
    return metric === "engaged" ? engaged / sessions : keyEvents / sessions;
  }, [metric, pages]);

  const visible = pages.filter((page) => page.sessions >= Number(minSessions));
  const maxSessions = Math.max(...visible.map((page) => page.sessions), 10);
  const xMax = 10 ** Math.ceil(Math.log10(maxSessions * 1.2));
  const xTicks = [1, 10, 100, 1000, 10000, 100000].filter((tick) => tick <= xMax);
  const yMax = metric === "engaged" ? 1 : Math.min(1, Math.max(...visible.map(valueOf), 0.05) * 1.3);
  const bySessions = [...visible].sort((a, b) => b.sessions - a.sessions);
  const points: QuadrantPoint[] = visible.map((page) => ({
    key: page.landing_page,
    label: page.landing_page,
    x: page.sessions,
    y: valueOf(page),
    z: Math.max(page.ad_spend_idr, 1),
    emphasized: page.sessions >= MIN_TRAFFIC && valueOf(page) < benchmark - CLEAR_GAP,
    directLabel: bySessions.indexOf(page) < 3,
    rows: [
      { label: "sessions", value: integer(page.sessions) },
      { label: "engaged", value: rate(page.engaged_rate) },
      { label: "key events", value: integer(page.key_events) },
      { label: "ad spend sent here", value: money(page.ad_spend_idr) },
      { label: "from Paid Social", value: rate(page.paid_share, 0) },
    ],
    note: page.sessions >= MIN_TRAFFIC && valueOf(page) < benchmark - CLEAR_GAP ? "Clearly below the site average with real traffic: fix this page first." : undefined,
  }));
  const fixFirst = points.filter((point) => point.emphasized);
  const topPage = pages[0];

  const devicePages = pages.filter((page) => page.mobile_sessions >= 5 && page.desktop_sessions >= 5).slice(0, 6);
  const groups = useMemo(() => destinationGroups(data.ads), [data.ads]);
  const maxAdSpend = Math.max(...data.ads.map((ad) => ad.spend_idr), 0);
  const starts = funnelValue(data, "form_starts");
  const submits = funnelValue(data, "form_submits");

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsStatStripOS
        stats={[
          { label: "Pages with traffic", value: integer(pages.length), info: "Distinct landing pages that started at least one session in this slice." },
          { label: "Top page share", value: topPage ? rate(topPage.sessions / Math.max(totalSessions, 1), 0) : "—", caption: topPage?.landing_page, info: "Share of all sessions that start on the busiest page. A high share means that one page decides most of your results." },
          { label: "Site engaged rate", value: rate(benchmark > 0 && metric === "engaged" ? benchmark : data.summary.current.engaged_rate), info: "Share of landing sessions that became engaged. This is the line drawn across the map below." },
          { label: "Form completion", value: starts > 0 ? rate(submits / starts) : "—", caption: `${integer(submits)} of ${integer(starts)} started`, info: "Form submits divided by form starts, across the whole site. GA4 does not yet tie these events to a page, so there is no per-page figure." },
          { label: "Key events", value: integer(sumOf(pages, (page) => page.key_events)), caption: hasKeyEvents ? "marked in GA4" : "none marked in GA4", info: "GA4 conversions on landing pages. Zero means form_submit is not marked as a key event in GA4, so pages are compared on engagement instead." },
        ]}
      />

      <AnalyticsSectionOS
        title="Landing page map"
        question="Which pages to fix first"
        info="Each bubble is a page. Further right means more traffic (the axis jumps by 10x), higher means better quality, and a bigger bubble means more ad spend sent there. The shaded corner is what matters: plenty of visitors, below-average quality."
        datasets={["ga4_landing_pages", "meta_ads"]}
        ignores={["campaign"]}
        takeaway={fixFirst.length > 0 ? <><strong className="font-semibold">{fixFirst.length} page{fixFirst.length > 1 ? "s" : ""} to fix first:</strong> real traffic but clearly below the site&apos;s {rate(benchmark, 0)} {metric === "engaged" ? "engaged rate" : "conversion"}.</> : topPage && topPage.sessions / Math.max(totalSessions, 1) > 0.8 ? <><strong className="font-semibold">{topPage.landing_page}</strong> takes {rate(topPage.sessions / Math.max(totalSessions, 1), 0)} of sessions, so it sets the site average. Judge it by the mobile and desktop split below.</> : undefined}
        controls={
          <>
            {hasKeyEvents && <AnalyticsToggleOS label="Quality measure" value={metricChoice} onChange={setMetricChoice} options={[{ value: "engaged", label: "Engaged" }, { value: "conversion", label: "Conversion" }]} />}
            <AnalyticsToggleOS label="Minimum sessions" value={minSessions} onChange={setMinSessions} options={[{ value: "1", label: "All" }, { value: "5", label: "5+" }, { value: "20", label: "20+" }]} />
          </>
        }
        emptyMessage={pages.length === 0 ? "No landing page data for this slice. Try removing the channel filter." : null}
        table={{
          filename: "landing-pages",
          rowKey: (page) => page.landing_page,
          rows: pages,
          columns: [
            { key: "page", label: "Landing page", value: (page) => page.landing_page },
            { key: "sessions", label: "Sessions", align: "right", value: (page) => page.sessions },
            { key: "users", label: "Users", align: "right", value: (page) => page.users },
            { key: "engaged", label: "Engaged", align: "right", value: (page) => page.engaged_rate, render: (page) => rate(page.engaged_rate) },
            { key: "time", label: "Avg engagement", align: "right", value: (page) => page.average_engagement_seconds, render: (page) => `${decimal(page.average_engagement_seconds, 0)}s` },
            { key: "key", label: "Key events", align: "right", value: (page) => page.key_events },
            { key: "paid", label: "Paid share", align: "right", value: (page) => page.paid_share, render: (page) => rate(page.paid_share, 0) },
            { key: "spend", label: "Ad spend", align: "right", value: (page) => page.ad_spend_idr, render: (page) => money(page.ad_spend_idr) },
            { key: "seo", label: "SEO clicks", align: "right", value: (page) => page.seo_clicks },
            { key: "position", label: "SEO position", align: "right", value: (page) => page.seo_average_position, render: (page) => decimal(page.seo_average_position) },
          ],
        }}
      >
        <WarehouseQuadrantChartOS
          points={points}
          xLabel="Sessions (log scale)"
          yLabel={metric === "engaged" ? "Engaged rate" : "Conversion rate"}
          formatX={integer}
          formatY={(value) => `${(value * 100).toFixed(0)}%`}
          xScale="log"
          xTicks={xTicks}
          xDomain={[1, xMax]}
          yDomain={[0, yMax]}
          xLine={{ value: MIN_TRAFFIC, label: `${MIN_TRAFFIC} sessions` }}
          yLine={{ value: benchmark, label: "Site average" }}
          zone={{ x1: MIN_TRAFFIC, x2: xMax, y1: 0, y2: benchmark, label: "Fix first" }}
          bubbleRange={[60, 800]}
          height={320}
        />
      </AnalyticsSectionOS>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsSectionOS
          title="Mobile versus desktop"
          question="Does a page lose people on one device"
          info="Two dots per page show its engaged rate on each device. A long line between them means the page works on one device and fails on the other. Meta traffic is mostly mobile, so an orange dot far to the left costs real money. Only pages with 5+ sessions on both devices appear."
          datasets={["ga4_landing_pages"]}
          ignores={["campaign"]}
          emptyMessage={devicePages.length === 0 ? "No page has at least 5 sessions on both mobile and desktop here. Widen the date range." : null}
          table={{
            filename: "landing-pages-by-device",
            rowKey: (page) => page.landing_page,
            rows: devicePages,
            columns: [
              { key: "page", label: "Landing page", value: (page) => page.landing_page },
              { key: "mobile", label: "Mobile sessions", align: "right", value: (page) => page.mobile_sessions },
              { key: "mobileRate", label: "Mobile engaged", align: "right", value: (page) => page.mobile_engaged_rate, render: (page) => rate(page.mobile_engaged_rate) },
              { key: "desktop", label: "Desktop sessions", align: "right", value: (page) => page.desktop_sessions },
              { key: "desktopRate", label: "Desktop engaged", align: "right", value: (page) => page.desktop_engaged_rate, render: (page) => rate(page.desktop_engaged_rate) },
            ],
          }}
        >
          <WarehouseDumbbellOS
            leftName="Mobile"
            rightName="Desktop"
            rows={devicePages.map((page) => ({ key: page.landing_page, label: page.landing_page, left: page.mobile_engaged_rate, right: page.desktop_engaged_rate, leftSessions: page.mobile_sessions, rightSessions: page.desktop_sessions }))}
          />
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          title="Where ad money lands"
          question="Which ads point to which destination"
          info="Ads grouped by destination. The bar is each ad's spend. Landing rate is page views divided by link clicks, so a low figure means people click but the page does not finish loading or they leave at once. Instant Form ads have no landing rate because no website is involved."
          datasets={["meta_ads"]}
          ignores={["host"]}
          emptyMessage={groups.length === 0 ? "No ad spend in this slice." : null}
          table={{
            filename: "ad-destinations",
            rowKey: (ad) => ad.id,
            rows: data.ads,
            columns: [
              { key: "ad", label: "Ad", value: (ad) => ad.name },
              { key: "destination", label: "Destination", value: (ad) => ad.destination_path ?? ad.destination_kind },
              { key: "spend", label: "Spend", align: "right", value: (ad) => ad.spend_idr, render: (ad) => money(ad.spend_idr) },
              { key: "landing", label: "Landing rate", align: "right", value: (ad) => ad.landing_rate, render: (ad) => rate(ad.landing_rate) },
              { key: "leads", label: "Leads", align: "right", value: (ad) => ad.total_leads },
              { key: "cpl", label: "Cost per lead", align: "right", value: (ad) => ad.cpl_idr, render: (ad) => moneyOrDash(ad.cpl_idr) },
            ],
          }}
        >
          <div className="flex flex-col gap-5">
            {groups.map((group) => {
              const spend = sumOf(group.ads, (ad) => ad.spend_idr);
              const leads = sumOf(group.ads, (ad) => ad.total_leads);
              return (
                <div key={group.title}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100" title={group.hint}>{group.title}</p>
                    <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">{money(spend)} · {integer(leads)} leads{leads >= 5 ? ` · ${money(spend / leads)} per lead` : ""}</p>
                  </div>
                  <WarehouseRankedBarsOS
                    maxValue={maxAdSpend}
                    items={[...group.ads].sort((a, b) => b.spend_idr - a.spend_idr).slice(0, 5).map((ad) => ({
                      key: ad.id,
                      label: ad.name,
                      value: ad.spend_idr,
                      display: money(ad.spend_idr),
                      leading: <AdThumbnailOS url={ad.thumbnail_url} />,
                      rows: [
                        { label: "spend", value: money(ad.spend_idr) },
                        { label: "link clicks", value: integer(ad.link_clicks) },
                        { label: "landing rate", value: ad.destination_kind === "instant_form" ? "No website" : rate(ad.landing_rate, 0) },
                        { label: "leads", value: integer(ad.total_leads) },
                        { label: "cost per lead", value: moneyOrDash(ad.cpl_idr) },
                      ],
                    }))}
                  />
                </div>
              );
            })}
          </div>
        </AnalyticsSectionOS>
      </div>
    </div>
  );
}
