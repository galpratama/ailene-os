"use client";

import type { WarehouseAd } from "@/apis/analytics";
import WarehouseHeatmapOS, { type HeatCell } from "@/components/charts/WarehouseHeatmapOS";
import WarehouseQuadrantChartOS, { type QuadrantPoint } from "@/components/charts/WarehouseQuadrantChartOS";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import WarehouseTrendChartOS from "@/components/charts/WarehouseTrendChartOS";
import AppButton from "@/components/buttons/AppButton";
import AdThumbnailOS from "@/components/elements/AdThumbnailOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsStatStripOS from "@/components/elements/AnalyticsStatStripOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import ChartHoverOS from "@/components/elements/ChartHoverOS";
import AppSelect from "@/components/fields/AppSelect";
import Label from "@/components/labels/Label";
import AnalyticsAdCostRankingOS from "@/components/static-sections/AnalyticsAdCostRankingOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { adVerdict, compact, decimal, integer, median, money, moneyOrDash, rankingLabel, rankingTone, rate, sumOf } from "@/lib/analytics-warehouse";
import { useMemo, useState } from "react";

type AudienceMetric = "spend" | "impressions" | "leads" | "cpl";
type AudienceRow = ReturnType<typeof useAnalyticsView>["data"]["meta_audience"][number];

const audienceMetric: Record<AudienceMetric, { label: string; value: (row: AudienceRow) => number | null; format: (value: number) => string }> = {
  spend: { label: "Spend", value: (row) => row.spend_idr, format: money },
  impressions: { label: "Impressions", value: (row) => row.impressions, format: compact },
  leads: { label: "Leads", value: (row) => row.leads, format: integer },
  cpl: { label: "Cost per lead", value: (row) => row.cpl_idr, format: money },
};

function Meter({ label, value, scale, display }: { label: string; value: number | null; scale: number; display: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-1 text-xs">
        <span className="text-gray-500 dark:text-zinc-400">{label}</span>
        <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{display}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-gray-100 dark:bg-zinc-800">
        {value !== null && <div className="h-full rounded-full bg-viz-1" style={{ width: `${scale > 0 ? Math.min((value / scale) * 100, 100) : 0}%` }} />}
      </div>
    </div>
  );
}

function CreativeCard({ ad, hookMedian, scales }: { ad: WarehouseAd; hookMedian: number | null; scales: { hook: number; hold: number; landing: number; ctr: number } }) {
  const verdict = adVerdict(ad, hookMedian);
  const isForm = ad.destination_kind === "instant_form";
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-line-soft p-3">
      <div className="flex gap-3">
        <AdThumbnailOS url={ad.thumbnail_url} size={56} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900 dark:text-zinc-100" title={ad.name}>{ad.name}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400" title={ad.campaign}>{isForm ? "Instant Form" : `Lands on ${ad.destination_path ?? "unknown page"}`}</p>
        </div>
      </div>
      <ChartHoverOS label={`${verdict.label}: ${verdict.advice}`} title="What to do" rows={[]} note={verdict.advice} className="w-fit rounded-full">
        <Label variant={verdict.tone}>{verdict.label}</Label>
      </ChartHoverOS>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Meter label="Hook" value={ad.hook_rate} scale={scales.hook} display={rate(ad.hook_rate)} />
        <Meter label="Hold" value={ad.hold_rate} scale={scales.hold} display={rate(ad.hold_rate)} />
        <Meter label="Landing" value={ad.landing_rate} scale={scales.landing} display={isForm ? "n/a" : rate(ad.landing_rate, 0)} />
        <Meter label="Link CTR" value={ad.link_ctr} scale={scales.ctr} display={rate(ad.link_ctr)} />
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line-soft pt-2 text-xs">
        <div><dt className="text-gray-500 dark:text-zinc-400">Spend</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{money(ad.spend_idr)}</dd></div>
        <div><dt className="text-gray-500 dark:text-zinc-400">Leads</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{integer(ad.total_leads)}</dd></div>
        <div><dt className="text-gray-500 dark:text-zinc-400">Per lead</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{moneyOrDash(ad.cpl_idr)}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-1">
        {([["Quality", ad.quality_ranking], ["Engagement", ad.engagement_ranking], ["Conversion", ad.conversion_ranking]] as const).map(([name, value]) => (
          <ChartHoverOS key={name} label={`Meta ${name} ranking: ${rankingLabel(value)}`} title={`Meta ${name.toLowerCase()} ranking`} rows={[{ label: "vs ads for the same audience", value: rankingLabel(value) }]} className="rounded-full">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
              <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: `var(--label-${rankingTone(value)})` }} />
              {name}
            </span>
          </ChartHoverOS>
        ))}
      </div>
    </article>
  );
}

export default function AnalyticsMetaWarehousePanelOS() {
  const { data } = useAnalyticsView();
  const ads = data.ads;
  const [destination, setDestination] = useState<"all" | "instant_form" | "landing_page">("all");
  const [sort, setSort] = useState<"spend" | "leads" | "hook">("spend");
  const [showAll, setShowAll] = useState(false);
  const [dimension, setDimension] = useState<"age_gender" | "placement" | "region" | "hour">("age_gender");
  const [metric, setMetric] = useState<AudienceMetric>("spend");

  const totals = useMemo(() => {
    const spend = sumOf(ads, (ad) => ad.spend_idr);
    const impressions = sumOf(ads, (ad) => ad.impressions);
    const clicks = sumOf(ads, (ad) => ad.link_clicks);
    const leads = sumOf(ads, (ad) => ad.total_leads);
    const frequency = impressions > 0 ? sumOf(ads, (ad) => (ad.frequency ?? 0) * ad.impressions) / impressions : null;
    return { spend, impressions, clicks, leads, frequency, ctr: impressions > 0 ? clicks / impressions : null, cpm: impressions > 0 ? (spend * 1000) / impressions : null, cpl: leads >= 5 ? spend / leads : null };
  }, [ads]);

  const hookMedian = useMemo(() => median(ads.filter((ad) => !ad.low_n_clicks && ad.hook_rate !== null).map((ad) => ad.hook_rate as number)), [ads]);
  const scales = useMemo(() => ({
    hook: Math.max(...ads.map((ad) => ad.hook_rate ?? 0), 0.01),
    hold: Math.max(...ads.map((ad) => ad.hold_rate ?? 0), 0.01),
    landing: 1,
    ctr: Math.max(...ads.map((ad) => ad.link_ctr ?? 0), 0.01),
  }), [ads]);

  const creatives = useMemo(() => {
    const chosen = ads.filter((ad) => destination === "all" || ad.destination_kind === destination);
    const key = { spend: (ad: WarehouseAd) => ad.spend_idr, leads: (ad: WarehouseAd) => ad.total_leads, hook: (ad: WarehouseAd) => ad.hook_rate ?? -1 }[sort];
    return [...chosen].sort((a, b) => key(b) - key(a));
  }, [ads, destination, sort]);

  const mapAds = ads.filter((ad) => ad.destination_kind === "landing_page" && ad.hook_rate !== null && ad.landing_rate !== null && !ad.low_n_clicks);
  const maxHook = Math.max(...mapAds.map((ad) => ad.hook_rate ?? 0), 0.05);
  const hookLine = median(mapAds.map((ad) => ad.hook_rate as number)) ?? 0;
  const points: QuadrantPoint[] = mapAds.map((ad) => {
    const verdict = adVerdict(ad, hookMedian);
    return {
      key: ad.id,
      label: ad.name,
      x: ad.hook_rate as number,
      y: ad.landing_rate as number,
      z: ad.spend_idr,
      emphasized: (ad.landing_rate as number) < 0.5 || verdict.key === "weak_hook",
      rows: [
        { label: "hook", value: rate(ad.hook_rate, 0) },
        { label: "landing", value: rate(ad.landing_rate, 0) },
        { label: "spend", value: money(ad.spend_idr) },
        { label: "leads", value: integer(ad.total_leads) },
      ],
      note: verdict.advice,
    };
  });

  const [pickedAd, setPickedAd] = useState<string | null>(null);
  const fatigueAds = useMemo(() => {
    const ids = new Set(data.ad_daily.map((row) => row.ad_id));
    return ads.filter((ad) => ids.has(ad.id)).sort((a, b) => b.spend_idr - a.spend_idr);
  }, [ads, data.ad_daily]);
  const selectedAdId = fatigueAds.some((ad) => ad.id === pickedAd) ? pickedAd : fatigueAds[0]?.id ?? null;
  const fatigueDays = useMemo(() => data.ad_daily.filter((row) => row.ad_id === selectedAdId), [data.ad_daily, selectedAdId]);
  const fatigue = useMemo(() => {
    if (fatigueDays.length < 4) return null;
    const first = fatigueDays.slice(0, 3);
    const clicks = sumOf(first, (row) => row.link_clicks);
    const impressions = sumOf(first, (row) => row.impressions);
    const baseline = impressions > 0 ? clicks / impressions : null;
    const last = fatigueDays.at(-1);
    if (!last || baseline === null || baseline === 0) return null;
    const drop = last.link_ctr !== null ? (baseline - last.link_ctr) / baseline : 0;
    return { fatigued: (last.frequency ?? 0) > 3 && drop > 0.3, baseline, drop, frequency: last.frequency };
  }, [fatigueDays]);

  const audience = useMemo(() => data.meta_audience.filter((row) => row.breakdown === dimension), [data.meta_audience, dimension]);
  const metricInfo = audienceMetric[metric];
  const rowsFor = (row: AudienceRow) => [
    { label: "spend", value: money(row.spend_idr) },
    { label: "impressions", value: integer(row.impressions) },
    { label: "link clicks", value: integer(row.link_clicks) },
    { label: "leads", value: integer(row.leads) },
    { label: "cost per lead", value: moneyOrDash(row.cpl_idr) },
  ];
  const heatCells: HeatCell[] = audience.map((row) => {
    const value = metricInfo.value(row);
    return { row: row.segment_1, column: row.segment_2 ?? "all", value, display: value === null ? "—" : metricInfo.format(value), rows: rowsFor(row), note: value === null ? "Cost per lead appears from 5 leads." : undefined };
  });
  const ageRows = [...new Set(audience.map((row) => row.segment_1))].sort();
  const genderColumns = ["female", "male", "unknown"].filter((gender) => audience.some((row) => row.segment_2 === gender));
  const hourRows = dimension === "hour" ? [...audience].sort((a, b) => parseInt(a.segment_1) - parseInt(b.segment_1)) : [];
  const hourMax = Math.max(...hourRows.map((row) => metricInfo.value(row) ?? 0), 0);

  const adEmpty = ads.length === 0 ? "No Meta ads in this slice. Meta data only exists for the Paid Social channel." : null;

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsStatStripOS
        stats={[
          { label: "Spend", value: money(totals.spend), info: "Total Meta spend in this period." },
          { label: "Leads", value: integer(totals.leads), info: "Meta form leads plus website form submits attributed to these ads." },
          { label: "Cost per lead", value: moneyOrDash(totals.cpl), info: "Spend divided by leads, shown from 5 leads. Lower is better." },
          { label: "Link CTR", value: rate(totals.ctr, 2), info: "Link clicks divided by impressions. Shows how well the ad earns a click." },
          { label: "CPM", value: moneyOrDash(totals.cpm), info: "Cost per 1,000 impressions. A rising CPM with a steady CTR means the audience is getting more expensive, not that the creative got worse." },
          { label: "Frequency", value: decimal(totals.frequency, 2), info: "Average times a person saw an ad. Above about 3 people start to tune out." },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsAdCostRankingOS />

        <AnalyticsSectionOS
          title="Creative diagnosis"
          question="Is the problem the hook or what comes after"
          info="For ads that send people to the website. Right means more people pass the first 3 seconds, up means more clicks actually load the page. Bottom-right is the classic mismatch: the hook works but the page does not deliver the promise. Far left is a weak opening. Instant Form ads are left out because they have no landing rate."
          datasets={["meta_ads"]}
          ignores={["host"]}
          emptyMessage={points.length === 0 ? "No website-bound video ad has 20+ link clicks in this slice." : null}
        >
          <WarehouseQuadrantChartOS
            points={points}
            xLabel="Hook rate (watched 3s)"
            yLabel="Landing rate"
            formatX={(value) => `${(value * 100).toFixed(0)}%`}
            formatY={(value) => `${(value * 100).toFixed(0)}%`}
            xDomain={[0, Math.min(1, maxHook * 1.25)]}
            yDomain={[0, 1]}
            xLine={{ value: hookLine, label: "Median hook" }}
            yLine={{ value: 0.5, label: "50% landing" }}
            zone={{ x1: hookLine, x2: Math.min(1, maxHook * 1.25), y1: 0, y2: 0.5, label: "Promise mismatch" }}
            bubbleRange={[60, 500]}
            height={300}
          />
        </AnalyticsSectionOS>
      </div>

      <AnalyticsSectionOS
        title="Creative scorecards"
        question="Every ad at a glance, with what to do next"
        info="One card per ad. Bars compare each rate with the best ad in this period, so a full bar means the leader here, not 100%. Hook is how many watched 3 seconds, hold is how many of those kept watching, landing is how many clicks loaded the page. Hover the verdict for the suggested action. The colored dots are Meta's own rankings against similar ads."
        datasets={["meta_ads"]}
        ignores={["host"]}
        emptyMessage={adEmpty}
        controls={
          <>
            <AnalyticsToggleOS label="Destination" value={destination} onChange={setDestination} options={[{ value: "all", label: "All" }, { value: "instant_form", label: "Instant Form" }, { value: "landing_page", label: "Landing page" }]} />
            <AnalyticsToggleOS label="Sort by" value={sort} onChange={setSort} options={[{ value: "spend", label: "Spend" }, { value: "leads", label: "Leads" }, { value: "hook", label: "Hook" }]} />
          </>
        }
        table={{
          filename: "meta-creatives",
          rowKey: (ad) => ad.id,
          rows: creatives,
          columns: [
            { key: "name", label: "Ad", value: (ad) => ad.name },
            { key: "campaign", label: "Campaign", value: (ad) => ad.campaign },
            { key: "status", label: "Status", value: (ad) => ad.status },
            { key: "verdict", label: "Verdict", value: (ad) => adVerdict(ad, hookMedian).label },
            { key: "spend", label: "Spend", align: "right", value: (ad) => ad.spend_idr, render: (ad) => money(ad.spend_idr) },
            { key: "impressions", label: "Impressions", align: "right", value: (ad) => ad.impressions },
            { key: "cpm", label: "CPM", align: "right", value: (ad) => ad.cpm_idr, render: (ad) => moneyOrDash(ad.cpm_idr) },
            { key: "ctr", label: "Link CTR", align: "right", value: (ad) => ad.link_ctr, render: (ad) => rate(ad.link_ctr) },
            { key: "hook", label: "Hook", align: "right", value: (ad) => ad.hook_rate, render: (ad) => rate(ad.hook_rate) },
            { key: "hold", label: "Hold", align: "right", value: (ad) => ad.hold_rate, render: (ad) => rate(ad.hold_rate) },
            { key: "landing", label: "Landing", align: "right", value: (ad) => ad.landing_rate, render: (ad) => rate(ad.landing_rate) },
            { key: "leads", label: "Leads", align: "right", value: (ad) => ad.total_leads },
            { key: "cpl", label: "Cost per lead", align: "right", value: (ad) => ad.cpl_idr, render: (ad) => moneyOrDash(ad.cpl_idr) },
          ],
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {(showAll ? creatives : creatives.slice(0, 8)).map((ad) => <CreativeCard key={ad.id} ad={ad} hookMedian={hookMedian} scales={scales} />)}
        </div>
        {creatives.length > 8 && (
          <div className="mt-3 flex justify-center">
            <AppButton type="button" variant="outline" size="sm" onClick={() => setShowAll((value) => !value)}>
              {showAll ? "Show fewer" : `Show all ${creatives.length} ads`}
            </AppButton>
          </div>
        )}
      </AnalyticsSectionOS>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsSectionOS
          title="Creative fatigue"
          question="Is an ad wearing out"
          info="Fatigue shows as frequency rising while click-through falls: the same people keep seeing an ad and stop responding. An ad is flagged when frequency passes 3 and CTR is over 30% below its first three days. The twelve highest-spend ads are available."
          datasets={["meta_ads"]}
          ignores={["host"]}
          emptyMessage={fatigueAds.length === 0 ? "No ad delivered in this slice." : null}
          takeaway={fatigue ? (fatigue.fatigued ? <><strong className="font-semibold">Showing fatigue.</strong> Frequency is {decimal(fatigue.frequency)} and CTR is {rate(fatigue.drop, 0)} below its first days. Consider a fresh creative.</> : <>No fatigue signal. Latest frequency is {decimal(fatigue.frequency)}, against the limit of 3.</>) : "This ad has under 4 days of delivery, too short to judge."}
          controls={<AppSelect selectId="fatigue-ad" className="w-52" placeholder="Choose an ad" value={selectedAdId} options={fatigueAds.map((ad) => ({ value: ad.id, label: ad.name }))} onChange={(value) => setPickedAd(String(value))} />}
          table={{
            filename: "creative-fatigue",
            rowKey: (row) => `${row.ad_id}-${row.date}`,
            rows: fatigueDays,
            columns: [
              { key: "date", label: "Date", value: (row) => row.date },
              { key: "impressions", label: "Impressions", align: "right", value: (row) => row.impressions },
              { key: "clicks", label: "Link clicks", align: "right", value: (row) => row.link_clicks },
              { key: "ctr", label: "Link CTR", align: "right", value: (row) => row.link_ctr, render: (row) => rate(row.link_ctr, 2) },
              { key: "frequency", label: "Frequency", align: "right", value: (row) => row.frequency, render: (row) => decimal(row.frequency, 2) },
            ],
          }}
        >
          <div className="flex flex-col gap-3">
            <WarehouseTrendChartOS syncId="fatigue" kind="area" allowDecimals label="Link CTR" format={(value) => `${(value * 100).toFixed(2)}%`} formatTick={(value) => `${(value * 100).toFixed(1)}%`} points={fatigueDays.map((row) => ({ date: row.date, value: row.link_ctr }))} showDates={false} height={96} />
            <WarehouseTrendChartOS syncId="fatigue" kind="area" allowDecimals color="var(--viz-3)" label="Frequency" format={(value) => value.toFixed(2)} formatTick={(value) => value.toFixed(1)} points={fatigueDays.map((row) => ({ date: row.date, value: row.frequency }))} height={96} />
          </div>
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          title="Who the ads reach"
          question="Which audiences take the money, and which respond"
          info="Pick a dimension and a measure. In the age and gender grid, darker means more of the chosen measure. Compare Spend with Leads: a dark Spend cell that stays pale on Leads is budget going to people who do not respond. Cost per lead only appears from 5 leads."
          datasets={["meta_audience"]}
          ignores={["host"]}
          emptyMessage={data.meta_audience.length === 0 ? "No Meta audience data in this slice. Breakdown data starts later than other Meta data, so try a more recent period." : null}
          controls={
            <>
              <AnalyticsToggleOS label="Dimension" value={dimension} onChange={setDimension} options={[{ value: "age_gender", label: "Age × gender" }, { value: "placement", label: "Placement" }, { value: "region", label: "Region" }, { value: "hour", label: "Hour" }]} />
              <AnalyticsToggleOS label="Measure" value={metric} onChange={setMetric} options={(Object.keys(audienceMetric) as AudienceMetric[]).map((key) => ({ value: key, label: key === "cpl" ? "CPL" : key === "impressions" ? "Impr." : audienceMetric[key].label }))} />
            </>
          }
          table={{
            filename: "meta-audience",
            rowKey: (row, index) => `${row.breakdown}-${row.segment_1}-${row.segment_2}-${index}`,
            rows: audience,
            columns: [
              { key: "segment", label: "Segment", value: (row) => (row.segment_2 ? `${row.segment_1} · ${row.segment_2}` : row.segment_1) },
              { key: "spend", label: "Spend", align: "right", value: (row) => row.spend_idr, render: (row) => money(row.spend_idr) },
              { key: "impressions", label: "Impressions", align: "right", value: (row) => row.impressions },
              { key: "clicks", label: "Link clicks", align: "right", value: (row) => row.link_clicks },
              { key: "leads", label: "Leads", align: "right", value: (row) => row.leads },
              { key: "cpl", label: "Cost per lead", align: "right", value: (row) => row.cpl_idr, render: (row) => moneyOrDash(row.cpl_idr) },
            ],
          }}
        >
          {dimension === "age_gender" && <WarehouseHeatmapOS rows={ageRows} columns={genderColumns} cells={heatCells} rowLabel="Age" scaleLabel={metricInfo.label.toLowerCase()} />}
          {(dimension === "placement" || dimension === "region") && (
            <WarehouseRankedBarsOS
              items={[...audience]
                .sort((a, b) => (metricInfo.value(b) ?? -1) - (metricInfo.value(a) ?? -1))
                .slice(0, 10)
                .map((row) => {
                  const value = metricInfo.value(row);
                  return { key: `${row.segment_1}-${row.segment_2}`, label: row.segment_2 ? `${row.segment_1.replaceAll("_", " ")} · ${row.segment_2.replaceAll("_", " ")}` : row.segment_1.replaceAll("_", " "), value: value ?? 0, display: value === null ? "—" : metricInfo.format(value), rows: rowsFor(row) };
                })}
            />
          )}
          {dimension === "hour" && (
            <div>
              <div className="flex h-44 items-end gap-0.5">
                {hourRows.map((row) => {
                  const value = metricInfo.value(row) ?? 0;
                  const hour = parseInt(row.segment_1);
                  return (
                    <ChartHoverOS key={row.segment_1} label={`${hour}:00, ${metricInfo.label}: ${metricInfo.format(value)}`} title={`${String(hour).padStart(2, "0")}:00 – ${String(hour).padStart(2, "0")}:59 WIB`} rows={rowsFor(row)} className="flex h-full min-w-0 flex-1 items-end rounded-t-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
                      <div className="w-full rounded-t-sm bg-viz-1" style={{ height: `${hourMax > 0 ? Math.max((value / hourMax) * 100, 1) : 1}%` }} />
                    </ChartHoverOS>
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-xs tabular-nums text-gray-500 dark:text-zinc-400"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
            </div>
          )}
        </AnalyticsSectionOS>
      </div>
    </div>
  );
}
