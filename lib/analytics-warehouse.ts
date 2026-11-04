import type { WarehouseAd, WarehouseAnalytics } from "@/apis/analytics";
import { getShortRupiahCurrency } from "@/lib/currency";

export const money = getShortRupiahCurrency;

export function integer(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function compact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

// Warehouse rates are decimal ratios: 0.25 means 25%.
export function rate(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`;
}

export function decimal(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined ? "—" : value.toFixed(digits);
}

export function moneyOrDash(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : money(value);
}

export function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function dateLongLabel(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function periodLabel(start: string, end: string) {
  return start === end ? dateLabel(start) : `${dateLabel(start)} – ${dateLabel(end)}`;
}

export function timestampLabel(value: string | null | undefined) {
  if (!value) return "—";
  const formatted = new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
  return `${formatted.replace(",", " ·")} WIB`;
}

export function ageLabel(value: string | null | undefined) {
  if (!value) return "never";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000);
}

export function sumOf<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((total, row) => total + pick(row), 0);
}

export function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Colors follow the channel, never its rank, so a filter cannot repaint a channel; the tail folds into Other.
const channelSlots: Record<string, number> = {
  "Paid Social": 1,
  Direct: 2,
  "Organic Search": 3,
  "Paid Search": 4,
  Referral: 5,
  "Organic Social": 6,
};

export const channelOrder = [...Object.keys(channelSlots), "Other"];

export function foldChannel(channel: string) {
  return channel in channelSlots ? channel : "Other";
}

export function channelColor(channel: string) {
  const slot = channelSlots[channel];
  return slot ? `var(--viz-${slot})` : "var(--viz-other)";
}

// Yellow is the one slot that needs dark text on top of it.
export function channelInk(channel: string) {
  return channelSlots[channel] === 5 ? "text-ink" : "text-white";
}

export type DatasetKey = "meta_ads" | "meta_audience" | "ga4_traffic" | "ga4_landing_pages" | "ga4_audience" | "search_console";

export const datasetInfo: Record<DatasetKey, { label: string; source: string }> = {
  meta_ads: { label: "Meta Ads", source: "meta_ads" },
  meta_audience: { label: "Meta audience", source: "meta_ads" },
  ga4_traffic: { label: "GA4 traffic", source: "ga4" },
  ga4_landing_pages: { label: "GA4 landing pages", source: "ga4" },
  ga4_audience: { label: "GA4 audience", source: "ga4" },
  search_console: { label: "Search Console", source: "search_console" },
};

export const sourceNames: Record<string, string> = {
  meta_ads: "Meta Ads",
  ga4: "GA4",
  search_console: "Search Console",
  google_ads: "Google Ads",
};

// Search Console publishes about two days late, so its "on time" allowance is wider than GA4 or Meta.
const allowedLagDays: Record<string, number> = { meta_ads: 1, ga4: 1, search_console: 3, google_ads: 1 };

export type SourceState = "healthy" | "late" | "stale" | "not_connected";

export function sourceState(source: string, lastDate: string | null, today: string): { state: SourceState; lagDays: number | null } {
  if (!lastDate) return { state: "not_connected", lagDays: null };
  const lagDays = daysBetween(lastDate, today);
  const allowed = allowedLagDays[source] ?? 1;
  if (lagDays <= allowed) return { state: "healthy", lagDays };
  return { state: lagDays <= allowed + 2 ? "late" : "stale", lagDays };
}

export function coverageOf(data: WarehouseAnalytics, dataset: DatasetKey) {
  return data.coverage.find((entry) => entry.dataset === dataset);
}

// A previous period that starts before the data does would turn into a meaningless +1000% delta.
export function isComparable(data: WarehouseAnalytics, datasets: DatasetKey[]) {
  return datasets.every((dataset) => {
    const first = coverageOf(data, dataset)?.first_date;
    return !!first && first <= data.period.previous_start_date;
  });
}

export function coverageWarnings(data: WarehouseAnalytics, datasets: DatasetKey[]) {
  const warnings: string[] = [];
  for (const dataset of datasets) {
    const entry = coverageOf(data, dataset);
    const label = datasetInfo[dataset].label;
    if (!entry?.first_date || !entry.last_date) continue;
    if (entry.first_date > data.period.start_date) warnings.push(`${label} starts ${dateLabel(entry.first_date)}, so earlier days in this period are empty.`);
    if (entry.last_date < data.period.end_date) warnings.push(`${label} is loaded through ${dateLabel(entry.last_date)}, so later days are still missing.`);
  }
  return warnings;
}

export type AdVerdict = { key: string; label: string; tone: "hijau" | "kuning" | "merah" | "gray"; advice: string };

// Follows the PRD creative diagnostics; a hook counts as weak against this account's own median, not an outside benchmark.
export function adVerdict(ad: WarehouseAd, hookMedian: number | null): AdVerdict {
  if (ad.low_n_clicks) return { key: "low_data", label: "Too little data", tone: "gray", advice: "Fewer than 20 link clicks in this period. Wait before judging this ad." };
  if (ad.destination_kind === "instant_form") {
    return ad.total_leads > 0
      ? { key: "leads", label: "Generating leads", tone: "hijau", advice: "Leads come straight from the Meta form. Compare its cost per lead with the others." }
      : { key: "no_leads", label: "No leads yet", tone: "kuning", advice: "The form opened but nobody submitted. Review the form questions and the offer." };
  }
  if (ad.hook_rate !== null && hookMedian !== null && ad.hook_rate < hookMedian * 0.7) return { key: "weak_hook", label: "Weak hook", tone: "kuning", advice: "Few viewers pass the first 3 seconds. Test a stronger opening." };
  if (ad.landing_rate !== null && ad.landing_rate < 0.5) return { key: "mismatch", label: "Clicks drop off", tone: "merah", advice: "Most clicks never load the page. Check page speed and whether the page matches the ad's promise." };
  if (ad.total_leads === 0) return { key: "no_conversion", label: "Lands, no leads", tone: "merah", advice: "People reach the page but no lead is recorded. Look at the page and form, or the form_submit tracking." };
  return { key: "healthy", label: "Healthy", tone: "hijau", advice: "Hook, landing, and leads all hold up. A candidate for more budget." };
}

export function rankingLabel(value: string | null) {
  if (!value) return "No rating";
  if (value === "ABOVE_AVERAGE") return "Above average";
  if (value === "AVERAGE") return "Average";
  const match = value.match(/BELOW_AVERAGE_(\d+)/);
  return match ? `Bottom ${match[1]}%` : value.replaceAll("_", " ").toLowerCase();
}

export function rankingTone(value: string | null): "hijau" | "kuning" | "merah" | "gray" {
  if (!value) return "gray";
  if (value === "ABOVE_AVERAGE") return "hijau";
  if (value === "AVERAGE") return "kuning";
  return value.startsWith("BELOW") ? "merah" : "gray";
}

export function funnelValue(data: WarehouseAnalytics, key: string) {
  return data.funnel.find((step) => step.key === key)?.value ?? 0;
}

export function deviceRates(data: WarehouseAnalytics) {
  const pick = (segment: string) => data.web_audience.find((row) => row.dimension === "device" && row.segment === segment);
  return { mobile: pick("mobile"), desktop: pick("desktop") };
}

export function leadSplitByDestination(ads: WarehouseAd[]) {
  const forms = ads.filter((ad) => ad.destination_kind === "instant_form");
  const pages = ads.filter((ad) => ad.destination_kind === "landing_page");
  return {
    formSpend: sumOf(forms, (ad) => ad.spend_idr),
    formLeads: sumOf(forms, (ad) => ad.total_leads),
    pageSpend: sumOf(pages, (ad) => ad.spend_idr),
    pageLeads: sumOf(pages, (ad) => ad.total_leads),
  };
}

export type Insight = { tone: "good" | "warn" | "bad" | "info"; title: string; detail: string };

// The Overview's plain-language read: at most four facts, each one something a person could act on.
export function overviewInsights(data: WarehouseAnalytics): Insight[] {
  const insights: Insight[] = [];
  const { current, changes } = data.summary;
  const comparable = isComparable(data, ["meta_ads", "ga4_traffic"]);
  const leadChange = comparable && changes.total_leads !== null ? ` (${changes.total_leads >= 0 ? "+" : ""}${changes.total_leads.toFixed(0)}% vs previous period)` : "";
  insights.push({
    tone: "info",
    title: `${integer(current.total_leads)} leads${leadChange}`,
    detail: `From ${money(current.spend_idr)} spend${current.cpl_idr !== null ? `, at ${money(current.cpl_idr)} per lead` : ". Cost per lead appears from 5 leads"}.`,
  });

  const split = leadSplitByDestination(data.ads);
  if (split.formSpend > 0 && split.pageSpend > 0) {
    insights.push({
      tone: split.pageLeads === 0 && split.pageSpend >= split.formSpend * 0.25 ? "bad" : "info",
      title: `Landing-page ads: ${integer(split.pageLeads)} leads from ${money(split.pageSpend)}`,
      detail: `Instant Form ads delivered ${integer(split.formLeads)} leads from ${money(split.formSpend)}.`,
    });
  }

  const starts = funnelValue(data, "form_starts");
  const submits = funnelValue(data, "form_submits");
  if (starts >= 10 && submits / starts < 0.2) {
    insights.push({
      tone: "bad",
      title: `Only ${integer(submits)} of ${integer(starts)} started forms were submitted`,
      detail: "Either the website form loses people or its form_submit event is not firing. Test the form first.",
    });
  }

  const { mobile, desktop } = deviceRates(data);
  if (mobile?.engaged_rate != null && desktop?.engaged_rate != null && desktop.engaged_rate - mobile.engaged_rate >= 0.15 && mobile.sessions >= 50) {
    insights.push({
      tone: "warn",
      title: `Mobile engages at ${rate(mobile.engaged_rate, 0)}, desktop at ${rate(desktop.engaged_rate, 0)}`,
      detail: `Mobile is ${rate(mobile.sessions / (mobile.sessions + desktop.sessions), 0)} of these sessions, so its experience matters most.`,
    });
  }
  return insights.slice(0, 4);
}
