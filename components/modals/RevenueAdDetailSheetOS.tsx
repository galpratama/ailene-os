"use client";

import type { RevenueAd, RevenueAdDay, RevenueAdDetail, RevenueAdMetrics, RevenueAdPipeline, RevenuePeriodPayload } from "@/apis/revenue";
import AppButton from "@/components/buttons/AppButton";
import WarehouseTrendChartOS from "@/components/charts/WarehouseTrendChartOS";
import AdThumbnailOS from "@/components/elements/AdThumbnailOS";
import AnalyticsDataTableOS, { toCsv, type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import AdVerdictLabelOS from "@/components/labels/AdVerdictLabelOS";
import Label from "@/components/labels/Label";
import SheetOS from "@/components/modals/SheetOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueAdDetail } from "@/lib/actions";
import { compact, dateLabel, decimal, rankingLabel, rankingTone, timestampLabel } from "@/lib/analytics-warehouse";
import { count, money, percent, revenuePeriodLabel } from "@/lib/revenue";
import { Download, ExternalLink, Loader2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type Kind = RevenueAd["destination_kind"];
type Value = number | null;

type Metric = {
  label: string;
  value: (row: RevenueAdMetrics) => Value;
  format: (value: Value) => string;
  info: string;
  lowerIsBetter?: boolean;
  shows?: (kind: Kind, current: RevenueAdMetrics) => boolean;
};

const kindLabels: Record<Kind, string> = { instant_form: "Instant Form", landing_page: "Landing page", unknown: "Unknown destination" };

const idr = (value: Value) => money(value);
const whole = (value: Value) => count(value === null ? null : Math.round(value));
const rate1 = (value: Value) => percent(value, 1);
const rate2 = (value: Value) => percent(value, 2);
const platformLeads = (row: RevenueAdMetrics) => row.meta_leads + row.web_leads;
const hasVideo = (_: Kind, current: RevenueAdMetrics) => current.video_views_3s > 0;

const metricGroups: { title: string; description: string; metrics: Metric[] }[] = [
  {
    title: "Delivery",
    description: "Seberapa banyak dan seberapa mahal ad ini tayang di Meta.",
    metrics: [
      { label: "Spend", value: (row) => row.spend_idr, format: idr, info: "Total Meta spend in the period." },
      { label: "Impressions", value: (row) => row.impressions, format: whole, info: "Times the ad was shown." },
      { label: "Frequency", value: (row) => row.frequency, format: (value) => decimal(value, 2), lowerIsBetter: true, info: "Average times one person saw the ad. Rising frequency with falling CTR is a sign of ad fatigue." },
      { label: "CPM", value: (row) => row.cpm_idr, format: idr, lowerIsBetter: true, info: "Spend per 1,000 impressions." },
    ],
  },
  {
    title: "Attention & clicks",
    description: "Apakah kreatifnya menahan perhatian dan membuat orang mengklik.",
    metrics: [
      { label: "Link clicks", value: (row) => row.link_clicks, format: whole, info: "Clicks on the ad's link." },
      { label: "Link CTR", value: (row) => row.link_ctr, format: rate2, info: "Link clicks over impressions." },
      { label: "CPC", value: (row) => row.cpc_idr, format: idr, lowerIsBetter: true, info: "Spend per link click." },
      { label: "Hook rate", value: (row) => row.hook_rate, format: rate1, shows: hasVideo, info: "3-second video views over impressions: how many stopped scrolling." },
      { label: "Hold rate", value: (row) => row.hold_rate, format: rate1, shows: hasVideo, info: "ThruPlays over 3-second views: how many kept watching." },
      { label: "3-second views", value: (row) => row.video_views_3s, format: whole, shows: hasVideo, info: "Video views of at least 3 seconds." },
      { label: "Landing rate", value: (row) => row.landing_rate, format: rate1, shows: (kind) => kind !== "instant_form", info: "Landing page views over link clicks: how many clicks actually loaded the page." },
      { label: "Engaged sessions", value: (row) => row.web_engaged_rate, format: rate1, shows: (kind) => kind === "landing_page", info: "Engaged website sessions over all sessions from this ad (GA4)." },
    ],
  },
  {
    title: "Leads & outcomes",
    description: "Lead yang tercatat Meta/website dibandingkan lead, SQL, meeting, dan deal yang benar-benar terjadi di OS.",
    metrics: [
      { label: "Platform leads", value: platformLeads, format: whole, info: "Leads Meta and the website counted (Meta form plus website form), before the OS sees them." },
      { label: "Cost per platform lead", value: (row) => row.cost_per_platform_lead_idr, format: idr, lowerIsBetter: true, info: "Spend over platform leads." },
      { label: "OS leads", value: (row) => row.leads, format: whole, info: "OS pipelines created in the period whose first touch was this ad." },
      { label: "SQL", value: (row) => row.sqls, format: whole, info: "Pipelines from this ad qualified in the period." },
      { label: "Lead to SQL", value: (row) => row.lead_to_sql_rate, format: rate1, info: "SQLs over OS leads in the period." },
      { label: "Cost per OS lead", value: (row) => row.cost_per_lead_idr, format: idr, lowerIsBetter: true, info: "Spend over OS leads." },
      { label: "Cost per SQL", value: (row) => row.cost_per_sql_idr, format: idr, lowerIsBetter: true, info: "Spend over SQLs: the figure the verdict judges." },
      { label: "Meetings booked", value: (row) => row.meetings, format: whole, info: "Meetings booked in the period from this ad's pipelines." },
      { label: "Won", value: (row) => row.won, format: whole, info: "Deals from this ad closed won in the period." },
      { label: "Revenue won", value: (row) => row.revenue, format: idr, info: "Value of the deals won in the period." },
    ],
  },
];

type Trend = { label: string; value: (row: RevenueAdDay) => Value; format: (value: number) => string; kind: "bar" | "area"; color: string; shows?: (current: RevenueAdMetrics) => boolean };

const trends: Trend[] = [
  { label: "Spend", value: (row) => row.spend_idr, format: idr, kind: "bar", color: "var(--viz-1)" },
  { label: "Impressions", value: (row) => row.impressions, format: compact, kind: "bar", color: "var(--viz-2)" },
  { label: "Link clicks", value: (row) => row.link_clicks, format: compact, kind: "bar", color: "var(--viz-3)" },
  { label: "Link CTR", value: (row) => row.link_ctr, format: rate2, kind: "area", color: "var(--viz-3)" },
  { label: "CPC", value: (row) => row.cpc_idr, format: idr, kind: "area", color: "var(--viz-4)" },
  { label: "Frequency", value: (row) => row.frequency, format: (value) => decimal(value, 2), kind: "area", color: "var(--viz-5)" },
  { label: "Hook rate", value: (row) => row.hook_rate, format: rate1, kind: "area", color: "var(--viz-2)", shows: (current) => current.video_views_3s > 0 },
  { label: "Platform leads", value: platformLeads, format: whole, kind: "bar", color: "var(--viz-6)" },
  { label: "OS leads", value: (row) => row.leads, format: whole, kind: "bar", color: "var(--viz-4)" },
  { label: "SQL", value: (row) => row.sqls, format: whole, kind: "bar", color: "var(--viz-1)" },
];

const dailyColumns: AnalyticsColumn<RevenueAdDay>[] = [
  { key: "date", label: "Date", value: (row) => row.date, render: (row) => dateLabel(row.date) },
  { key: "spend", label: "Spend", value: (row) => row.spend_idr, render: (row) => money(row.spend_idr), align: "right" },
  { key: "impressions", label: "Impr.", value: (row) => row.impressions, render: (row) => count(row.impressions), align: "right" },
  { key: "frequency", label: "Freq.", value: (row) => row.frequency, render: (row) => decimal(row.frequency, 2), align: "right" },
  { key: "cpm", label: "CPM", value: (row) => row.cpm_idr, render: (row) => money(row.cpm_idr), align: "right" },
  { key: "clicks", label: "Link clicks", value: (row) => row.link_clicks, render: (row) => count(row.link_clicks), align: "right" },
  { key: "ctr", label: "CTR", value: (row) => row.link_ctr, render: (row) => rate2(row.link_ctr), align: "right" },
  { key: "cpc", label: "CPC", value: (row) => row.cpc_idr, render: (row) => money(row.cpc_idr), align: "right" },
  { key: "lpv", label: "LP views", value: (row) => row.landing_page_views, render: (row) => whole(row.landing_page_views), align: "right" },
  { key: "landing", label: "Landing rate", value: (row) => row.landing_rate, render: (row) => rate1(row.landing_rate), align: "right" },
  { key: "views", label: "3s views", value: (row) => row.video_views_3s, render: (row) => whole(row.video_views_3s), align: "right" },
  { key: "hook", label: "Hook", value: (row) => row.hook_rate, render: (row) => rate1(row.hook_rate), align: "right" },
  { key: "hold", label: "Hold", value: (row) => row.hold_rate, render: (row) => rate1(row.hold_rate), align: "right" },
  { key: "meta-leads", label: "Meta leads", value: (row) => row.meta_leads, render: (row) => whole(row.meta_leads), align: "right" },
  { key: "web-leads", label: "Web leads", value: (row) => row.web_leads, render: (row) => whole(row.web_leads), align: "right" },
  { key: "cppl", label: "Per platform lead", value: (row) => row.cost_per_platform_lead_idr, render: (row) => money(row.cost_per_platform_lead_idr), align: "right" },
  { key: "leads", label: "OS leads", value: (row) => row.leads, align: "right" },
  { key: "sqls", label: "SQL", value: (row) => row.sqls, align: "right" },
  { key: "meetings", label: "Meetings", value: (row) => row.meetings, align: "right" },
  { key: "won", label: "Won", value: (row) => row.won, align: "right" },
  { key: "revenue", label: "Revenue", value: (row) => row.revenue, render: (row) => money(row.revenue), align: "right" },
  { key: "cpl", label: "Per OS lead", value: (row) => row.cost_per_lead_idr, render: (row) => money(row.cost_per_lead_idr), align: "right" },
  { key: "cpsql", label: "Per SQL", value: (row) => row.cost_per_sql_idr, render: (row) => money(row.cost_per_sql_idr), align: "right" },
];

const pipelineColumns: AnalyticsColumn<RevenueAdPipeline>[] = [
  { key: "company", label: "Company", value: (row) => row.company_name },
  {
    key: "stage",
    label: "Stage",
    value: (row) => row.stage_name,
    render: (row) => <Label variant={row.stage_code === "closed_won" ? "hijau" : row.is_terminal ? "merah" : "gray"}>{row.stage_name}</Label>,
  },
  { key: "owner", label: "Owner", value: (row) => row.owner_name },
  { key: "created", label: "Lead created", value: (row) => row.created_at, render: (row) => timestampLabel(row.created_at) },
  { key: "qualified", label: "SQL", value: (row) => row.qualified_at, render: (row) => timestampLabel(row.qualified_at) },
  { key: "meeting", label: "Meeting booked", value: (row) => row.meeting_booked_at, render: (row) => timestampLabel(row.meeting_booked_at) },
  { key: "closed", label: "Closed", value: (row) => row.closed_at, render: (row) => timestampLabel(row.closed_at) },
];

function relativeChange(current: Value, previous: Value) {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / previous;
}

function titleCase(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Section({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
          {description && <p className="text-xs text-gray-500 dark:text-zinc-400">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// Opens from a Meta ad card: the ad's creative, its period totals against the previous period, and every day of the period.
export default function RevenueAdDetailSheetOS({
  ad,
  benchmarkCostPerSQL,
  period,
  enabled,
  onClose,
}: {
  ad: RevenueAd | null;
  benchmarkCostPerSQL: number | null;
  period: RevenuePeriodPayload;
  enabled: boolean;
  onClose: () => void;
}) {
  const adID = ad?.ad_id ?? "";
  const detail = useRevenue<RevenueAdDetail>("ads/detail", { ...period, ad_id: adID }, () => getRevenueAdDetail({ ...period, ad_id: adID }), enabled && !!ad);
  const data = detail.data;

  return (
    <SheetOS title={ad?.ad_name ?? ad?.ad_id ?? "Ad detail"} description={ad?.campaign ?? undefined} isOpen={!!ad} onClose={onClose} extraWide>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
        {detail.isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-gray-400" aria-label="Loading ad detail" />
          </div>
        ) : detail.isError || !data || !ad ? (
          <RevenueErrorOS error={detail.error} onRetry={() => detail.refetch()} />
        ) : (
          <AdDetailBody ad={ad} data={data} benchmarkCostPerSQL={benchmarkCostPerSQL} />
        )}
      </div>
    </SheetOS>
  );
}

function AdDetailBody({ ad, data, benchmarkCostPerSQL }: { ad: RevenueAd; data: RevenueAdDetail; benchmarkCostPerSQL: number | null }) {
  const profile = data.ad;
  const kind = profile.destination_kind;
  const previousLabel = revenuePeriodLabel(data.period.previous_start_date, data.period.previous_end_date);
  const syncId = `ad-detail-${profile.ad_id}`;
  const csvName = `meta-ad-${profile.ad_id}-${data.period.start_date}-to-${data.period.end_date}`;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row">
        <AdThumbnailOS url={profile.thumbnail_url} size={96} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <AdVerdictLabelOS verdict={ad.verdict} />
            {profile.status && <Label variant={profile.status === "ACTIVE" ? "hijau" : "gray"}>{titleCase(profile.status)}</Label>}
            <Label variant="gray">{kindLabels[kind]}</Label>
            {profile.creative_type && <Label variant="gray">{titleCase(profile.creative_type)}</Label>}
          </div>
          {profile.headline && <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{profile.headline}</p>}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            {[
              ["Campaign", profile.campaign ?? "—"],
              ["Ad set", profile.adset ?? "—"],
              ["Call to action", profile.call_to_action ? titleCase(profile.call_to_action) : "—"],
              ["Ad ID", profile.ad_id],
              ["In warehouse", profile.first_date ? `${dateLabel(profile.first_date)} – ${dateLabel(profile.last_date)}` : "—"],
              ["Days with spend", `${count(data.current.active_days)} of ${count(data.period.days)}`],
            ].map(([label, value]) => (
              <div key={label} className="flex min-w-0 gap-2">
                <dt className="shrink-0 text-gray-500 dark:text-zinc-400">{label}</dt>
                <dd className="truncate font-medium text-gray-800 dark:text-zinc-200">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
            {([["Quality", profile.quality_ranking], ["Engagement", profile.engagement_ranking], ["Conversion", profile.conversion_ranking]] as const).map(([name, value]) => (
              <span key={name} className="inline-flex items-center gap-1" title={`Meta ${name.toLowerCase()} ranking vs ads for the same audience`}>
                <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: `var(--label-${rankingTone(value)})` }} />
                {name}: <span className="font-medium text-gray-700 dark:text-zinc-300">{rankingLabel(value)}</span>
              </span>
            ))}
            {profile.destination_url && (
              <AppButton variant="textLink" size="textLink" href={profile.destination_url}>
                Destination <ExternalLink size={12} aria-hidden="true" />
              </AppButton>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Cost per SQL <span className="font-semibold text-gray-800 dark:text-zinc-200">{money(data.current.cost_per_sql_idr)}</span> against the{" "}
            <span className="font-semibold text-gray-800 dark:text-zinc-200">{money(benchmarkCostPerSQL)}</span> average of all ads with SQLs in this period.
          </p>
        </div>
      </div>

      {data.data_gaps.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-line-soft px-3 py-2 text-xs" style={{ color: "var(--label-kuning)" }}>
          {data.data_gaps.map((gap) => (
            <p key={gap.code} className="flex items-start gap-1.5">
              <TriangleAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{gap.message}</span>
            </p>
          ))}
        </div>
      )}

      {metricGroups.map((group) => (
        <Section key={group.title} title={group.title} description={`${group.description} Perubahan dibandingkan ${previousLabel}.`}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {group.metrics
              .filter((metric) => !metric.shows || metric.shows(kind, data.current))
              .map((metric) => {
                const current = metric.value(data.current);
                return (
                  <RevenueKpiOS
                    key={metric.label}
                    label={metric.label}
                    info={metric.info}
                    value={metric.format(current)}
                    change={relativeChange(current, metric.value(data.previous))}
                    changeLabel="previous period"
                    invertChange={metric.lowerIsBetter}
                    lines={[<span key="previous">Previous: {metric.format(metric.value(data.previous))}</span>]}
                  />
                );
              })}
          </div>
        </Section>
      ))}

      <Section title="Day by day" description="Performa harian ad ini sepanjang periode. Arahkan kursor ke satu grafik untuk melihat hari yang sama di semua grafik.">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-line p-4 sm:grid-cols-2">
          {trends
            .filter((trend) => !trend.shows || trend.shows(data.current))
            .map((trend) => (
              <WarehouseTrendChartOS
                key={trend.label}
                label={trend.label}
                points={data.daily.map((day) => ({ date: day.date, value: trend.value(day) }))}
                format={trend.format}
                kind={trend.kind}
                color={trend.color}
                syncId={syncId}
                allowDecimals={trend.kind === "area"}
              />
            ))}
        </div>
      </Section>

      <Section
        title="Daily table"
        description="Semua metrik per hari; klik judul kolom untuk mengurutkan."
        action={
          <AppButton type="button" variant="outline" size="sm" onClick={() => downloadCsv(`${csvName}-daily.csv`, toCsv(dailyColumns, data.daily))}>
            <Download size={13} aria-hidden="true" />
            CSV
          </AppButton>
        }
      >
        <AnalyticsDataTableOS columns={dailyColumns} rows={data.daily} rowKey={(row) => row.date} />
      </Section>

      <Section
        title={`OS leads from this ad (${count(data.pipelines.length)})`}
        description="Lead di OS yang dibuat dalam periode ini dengan first touch dari ad ini, beserta progresnya."
        action={
          data.pipelines.length > 0 && (
            <AppButton type="button" variant="outline" size="sm" onClick={() => downloadCsv(`${csvName}-leads.csv`, toCsv(pipelineColumns, data.pipelines))}>
              <Download size={13} aria-hidden="true" />
              CSV
            </AppButton>
          )
        }
      >
        {data.pipelines.length > 0 ? (
          <AnalyticsDataTableOS columns={pipelineColumns} rows={data.pipelines} rowKey={(row) => String(row.pipeline_id)} />
        ) : (
          <p className="rounded-lg border border-line-soft px-3 py-6 text-center text-sm text-gray-500 dark:text-zinc-400">No OS lead was created from this ad in this period.</p>
        )}
      </Section>
    </>
  );
}
