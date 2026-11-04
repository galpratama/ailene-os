"use client";

import WarehouseRankedBarsOS, { type RankedItem } from "@/components/charts/WarehouseRankedBarsOS";
import AdThumbnailOS from "@/components/elements/AdThumbnailOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { integer, money, moneyOrDash, rate, sumOf } from "@/lib/analytics-warehouse";
import type { WarehouseAd } from "@/apis/analytics";
import { useMemo, useState } from "react";

function adItem(ad: WarehouseAd, value: number, display: string, color: string): RankedItem {
  return {
    key: ad.id,
    label: ad.name,
    value,
    display,
    color,
    leading: <AdThumbnailOS url={ad.thumbnail_url} />,
    rows: [
      { label: "cost per lead", value: moneyOrDash(ad.cpl_idr) },
      { label: "spend", value: money(ad.spend_idr) },
      { label: "leads", value: integer(ad.total_leads) },
      { label: "link CTR", value: rate(ad.link_ctr) },
    ],
    note: ad.low_n_leads ? "Fewer than 20 leads, so treat this as a signal rather than a verdict." : undefined,
  };
}

// Answers which ads to scale or cut: cheapest leads first, then the ads spending without producing a CPL at all.
export default function AnalyticsAdCostRankingOS() {
  const { data } = useAnalyticsView();
  const [sample, setSample] = useState<"reliable" | "all">("reliable");

  const { cheapest, costliest, noCpl, noCplSpend } = useMemo(() => {
    const priced = data.ads.filter((ad) => ad.cpl_idr !== null && (sample === "all" || !ad.low_n_leads)).sort((a, b) => (a.cpl_idr ?? 0) - (b.cpl_idr ?? 0));
    const top = priced.slice(0, 5);
    const rest = priced.slice(5).slice(-5);
    const unpriced = data.ads.filter((ad) => ad.cpl_idr === null && ad.spend_idr > 0).sort((a, b) => b.spend_idr - a.spend_idr);
    return { cheapest: top, costliest: rest, noCpl: unpriced.slice(0, 5), noCplSpend: sumOf(unpriced, (ad) => ad.spend_idr) };
  }, [data.ads, sample]);

  const maxCpl = Math.max(...[...cheapest, ...costliest].map((ad) => ad.cpl_idr ?? 0), 0);
  const ranked = [...cheapest, ...costliest];

  return (
    <AnalyticsSectionOS
      title="Ads by cost per lead"
      question="Which ads to scale, and which to cut"
      info="A shorter bar is better here because it means each lead costs less. Reliable ads have at least 20 leads in the period, so a lucky day cannot top the list. Ads with fewer than 5 leads have no cost per lead, so they appear under 'Spending without a cost per lead'."
      datasets={["meta_ads"]}
      ignores={["host"]}
      controls={<AnalyticsToggleOS label="Ad sample" value={sample} onChange={setSample} options={[{ value: "reliable", label: "20+ leads" }, { value: "all", label: "5+ leads" }]} />}
      emptyMessage={data.ads.length === 0 ? "No Meta ad delivered in this slice. Meta data only exists for the Paid Social channel." : null}
      table={{
        filename: "ads-by-cost-per-lead",
        rowKey: (ad) => ad.id,
        rows: data.ads,
        columns: [
          { key: "name", label: "Ad", value: (ad) => ad.name },
          { key: "spend", label: "Spend", align: "right", value: (ad) => ad.spend_idr, render: (ad) => money(ad.spend_idr) },
          { key: "leads", label: "Leads", align: "right", value: (ad) => ad.total_leads },
          { key: "cpl", label: "Cost per lead", align: "right", value: (ad) => ad.cpl_idr, render: (ad) => moneyOrDash(ad.cpl_idr) },
          { key: "ctr", label: "Link CTR", align: "right", value: (ad) => ad.link_ctr, render: (ad) => rate(ad.link_ctr) },
        ],
      }}
    >
      <div className="flex flex-col gap-5">
        {ranked.length > 0 ? (
          <WarehouseRankedBarsOS maxValue={maxCpl} items={ranked.map((ad) => adItem(ad, ad.cpl_idr ?? 0, moneyOrDash(ad.cpl_idr), "var(--viz-1)"))} />
        ) : (
          <p className="rounded-lg border border-line-soft px-3 py-4 text-center text-xs text-gray-500 dark:text-zinc-400">
            {sample === "reliable" ? "No ad reached 20 leads in this period. Switch to 5+ leads for an early signal, or widen the date range." : "No ad reached 5 leads in this period."}
          </p>
        )}
        {noCpl.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">Spending without a cost per lead · {money(noCplSpend)} in total</p>
            <WarehouseRankedBarsOS items={noCpl.map((ad) => adItem(ad, ad.spend_idr, `${money(ad.spend_idr)} · ${integer(ad.total_leads)} leads`, "var(--viz-3)"))} />
          </div>
        )}
      </div>
    </AnalyticsSectionOS>
  );
}
