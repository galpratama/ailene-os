import {
  BIZ_BLOCKS,
  BIZ_BLOCK_LABELS,
  BIZ_FEATURE_LABELS,
  BIZ_LEAD_FEATURES,
  BIZ_SCROLL_BLOCKS,
  type BizBlock,
  type FeatureName,
} from "@/lib/biz-blocks";
import {
  getAnalyticsClient,
  getBizAnalyticsClient,
  getGA4BizProperty,
  getGA4Property,
} from "@/lib/google-analytics";
import {
  STATUS_BAD_REQUEST,
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_OK,
} from "@/lib/status_code";
import { administratorProcedure } from "@/trpc/init";
import type { protos } from "@google-analytics/data";
import { TRPCError } from "@trpc/server";
import z from "zod";

const TRACKED_SITE_IDS = [
  "jagohermes.com",
  "kelasclaude.com",
  "belajarvibecoding.com",
  "belajarkoding.com",
] as const;

type TrackedSiteId = (typeof TRACKED_SITE_IDS)[number];

const TRACKED_SITES: {
  id: TrackedSiteId;
  label: string;
  hosts: string[];
}[] = [
  {
    id: "jagohermes.com",
    label: "Jago Hermes",
    hosts: ["jagohermes.com", "www.jagohermes.com"],
  },
  {
    id: "kelasclaude.com",
    label: "Kelas Claude",
    hosts: ["kelasclaude.com", "www.kelasclaude.com"],
  },
  {
    id: "belajarvibecoding.com",
    label: "Belajar Vibe Coding",
    hosts: ["belajarvibecoding.com", "www.belajarvibecoding.com"],
  },
  {
    id: "belajarkoding.com",
    label: "Belajar Koding",
    hosts: ["belajarkoding.com", "www.belajarkoding.com"],
  },
];

const FUNNEL_EVENTS = [
  { event: "page_view", label: "Landing Page View" },
  { event: "view_item", label: "View Pricing / Product" },
  { event: "add_to_cart", label: "Click CTA" },
  { event: "begin_checkout", label: "Begin Checkout" },
  { event: "purchase", label: "Purchase" },
] as const;

type GA4Row = protos.google.analytics.data.v1beta.IRow;
type GA4Report = protos.google.analytics.data.v1beta.IRunReportResponse;

function dimension(row: GA4Row, index: number) {
  return row.dimensionValues?.[index]?.value ?? "";
}

function metric(row: GA4Row, index: number) {
  const value = Number(row.metricValues?.[index]?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function daysBetween(startDate: string, endDate: string) {
  return (
    Math.floor(
      (new Date(`${endDate}T00:00:00.000Z`).getTime() -
        new Date(`${startDate}T00:00:00.000Z`).getTime()) /
        86_400_000
    ) + 1
  );
}

function hostFilter(website?: TrackedSiteId) {
  const hosts = website
    ? TRACKED_SITES.find((site) => site.id === website)?.hosts ?? []
    : TRACKED_SITES.flatMap((site) => [...site.hosts]);

  return {
    filter: {
      fieldName: "hostName",
      inListFilter: {
        values: hosts,
        caseSensitive: false,
      },
    },
  } satisfies protos.google.analytics.data.v1beta.IFilterExpression;
}

function eventFilter() {
  return {
    filter: {
      fieldName: "eventName",
      inListFilter: {
        values: FUNNEL_EVENTS.map((entry) => entry.event),
        caseSensitive: true,
      },
    },
  } satisfies protos.google.analytics.data.v1beta.IFilterExpression;
}

function andFilter(
  ...expressions: protos.google.analytics.data.v1beta.IFilterExpression[]
) {
  return {
    andGroup: { expressions },
  } satisfies protos.google.analytics.data.v1beta.IFilterExpression;
}

function metricRecord(row?: GA4Row) {
  return {
    users: row ? metric(row, 0) : 0,
    sessions: row ? metric(row, 1) : 0,
    page_views: row ? metric(row, 2) : 0,
    purchases: row ? metric(row, 3) : 0,
    revenue: row ? metric(row, 4) : 0,
  };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function normalizeDailyRows(
  rows: GA4Row[],
  startDate: string,
  endDate: string
) {
  const rowMap = new Map(
    rows.map((row) => [
      dimension(row, 0),
      {
        sessions: metric(row, 0),
        users: metric(row, 1),
        revenue: metric(row, 2),
      },
    ])
  );
  const dates = [];
  let cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10).replaceAll("-", "");
    dates.push({
      date: formatDate(cursor),
      sessions: rowMap.get(key)?.sessions ?? 0,
      users: rowMap.get(key)?.users ?? 0,
      revenue: rowMap.get(key)?.revenue ?? 0,
    });
    cursor = addDays(cursor, 1);
  }
  return dates;
}

const inputSchema = z
  .object({
    start_date: z.iso.date(),
    end_date: z.iso.date(),
    website: z
      .enum(TRACKED_SITE_IDS)
      .optional(),
  })
  .superRefine((input, ctx) => {
    const days = daysBetween(input.start_date, input.end_date);
    if (days < 1) {
      ctx.addIssue({
        code: "custom",
        message: "end_date must be on or after start_date.",
      });
    }
    if (days > 366) {
      ctx.addIssue({
        code: "custom",
        message: "The maximum reporting period is 366 days.",
      });
    }
  });

// --- Marketing site (B2B) --------------------------------------------------

// Event-scoped custom dimensions; they resolve only once registered in the GA4 property.
const FEATURE_ID_DIMENSION = "customEvent:feature_id";
const FEATURE_NAME_DIMENSION = "customEvent:feature_name";
const DATE_RANGE_DIMENSION = "dateRange";

// Landing page scroll story; one event or block per stage so GA4 user counts need no summing.
const BIZ_FUNNEL_STAGES = [
  {
    // Hero view fires on mount so it counts landing page arrivals; page_view would fold in /join-trainer.
    key: "landing",
    label: "Opened the landing page",
    hint: "hero section",
    source: { kind: "block", block: "hero" },
  },
  {
    key: "engaged",
    label: "Read the value prop",
    hint: "outcomes section",
    source: { kind: "block", block: "outcomes" },
  },
  {
    key: "evaluated",
    label: "Evaluated the programs",
    hint: "programs section",
    source: { kind: "block", block: "programs" },
  },
  {
    key: "reached_form",
    label: "Reached the lead form",
    hint: "lead_form section",
    source: { kind: "block", block: "lead_form" },
  },
  {
    key: "lead",
    label: "Contacted sales",
    hint: "WhatsApp or form submit",
    source: { kind: "event", event: "click", features: BIZ_LEAD_FEATURES },
  },
] as const satisfies readonly {
  key: string;
  label: string;
  hint: string;
  source:
    | { kind: "event"; event: string; features: readonly string[] }
    | { kind: "block"; block: BizBlock };
}[];

// Extra date ranges shift column positions, so resolve dimensions by header name.
function dimensionByName(
  report: GA4Report | undefined,
  row: GA4Row,
  name: string
) {
  const index =
    report?.dimensionHeaders?.findIndex((header) => header.name === name) ?? -1;
  return index < 0 ? "" : dimension(row, index);
}

function eventNameFilter(...events: string[]) {
  return {
    filter: {
      fieldName: "eventName",
      inListFilter: { values: events, caseSensitive: true },
    },
  } satisfies protos.google.analytics.data.v1beta.IFilterExpression;
}

function featureNameFilter(...features: string[]) {
  return {
    filter: {
      fieldName: FEATURE_NAME_DIMENSION,
      inListFilter: { values: features, caseSensitive: true },
    },
  } satisfies protos.google.analytics.data.v1beta.IFilterExpression;
}

function bizMetricRecord(row?: GA4Row) {
  return {
    users: row ? metric(row, 0) : 0,
    sessions: row ? metric(row, 1) : 0,
    page_views: row ? metric(row, 2) : 0,
  };
}

// One row per day in the period, so a day with no traffic still plots as a zero.
function normalizeBizDailyRows(
  trafficRows: GA4Row[],
  leadRows: GA4Row[],
  startDate: string,
  endDate: string
) {
  const trafficMap = new Map(
    trafficRows.map((row) => [
      dimension(row, 0),
      { sessions: metric(row, 0), users: metric(row, 1) },
    ])
  );
  const leadMap = new Map(
    leadRows.map((row) => [dimension(row, 0), metric(row, 0)])
  );

  const days = [];
  let cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10).replaceAll("-", "");
    days.push({
      date: formatDate(cursor),
      sessions: trafficMap.get(key)?.sessions ?? 0,
      users: trafficMap.get(key)?.users ?? 0,
      leads: leadMap.get(key) ?? 0,
    });
    cursor = addDays(cursor, 1);
  }
  return days;
}

const bizInputSchema = z
  .object({
    start_date: z.iso.date(),
    end_date: z.iso.date(),
  })
  .superRefine((input, ctx) => {
    const days = daysBetween(input.start_date, input.end_date);
    if (days < 1) {
      ctx.addIssue({
        code: "custom",
        message: "end_date must be on or after start_date.",
      });
    }
    if (days > 366) {
      ctx.addIssue({
        code: "custom",
        message: "The maximum reporting period is 366 days.",
      });
    }
  });

export const listAnalytics = {
  ga4Dashboard: administratorProcedure
    .input(inputSchema)
    .query(async ({ input }) => {
      const periodDays = daysBetween(input.start_date, input.end_date);
      if (periodDays < 1 || periodDays > 366) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Invalid reporting period.",
        });
      }

      const previousEnd = addDays(
        new Date(`${input.start_date}T00:00:00.000Z`),
        -1
      );
      const previousStart = addDays(previousEnd, -(periodDays - 1));
      const dateRanges = [
        {
          name: "current",
          startDate: input.start_date,
          endDate: input.end_date,
        },
        {
          name: "previous",
          startDate: formatDate(previousStart),
          endDate: formatDate(previousEnd),
        },
      ];
      const currentDateRange = [
        { startDate: input.start_date, endDate: input.end_date },
      ];
      const websiteFilter = hostFilter(input.website);

      const requests: protos.google.analytics.data.v1beta.IRunReportRequest[] = [
        {
          dateRanges,
          dimensionFilter: websiteFilter,
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "ecommercePurchases" },
            { name: "totalRevenue" },
          ],
        },
        {
          dateRanges: currentDateRange,
          dimensionFilter: websiteFilter,
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "totalRevenue" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 366,
        },
        {
          dateRanges: currentDateRange,
          dimensionFilter: andFilter(websiteFilter, eventFilter()),
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          limit: 20,
        },
        {
          dateRanges: currentDateRange,
          dimensionFilter: websiteFilter,
          dimensions: [{ name: "hostName" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "ecommercePurchases" },
            { name: "totalRevenue" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 20,
        },
        {
          dateRanges: currentDateRange,
          dimensionFilter: websiteFilter,
          dimensions: [
            { name: "sessionDefaultChannelGroup" },
            { name: "sessionSourceMedium" },
          ],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "ecommercePurchases" },
            { name: "totalRevenue" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 12,
        },
      ];

      try {
        const [batchResponse] = await getAnalyticsClient().batchRunReports({
          property: getGA4Property(),
          requests,
        });
        const reports = batchResponse.reports ?? [];
        const summaryReport = reports[0] as GA4Report | undefined;
        const dailyReport = reports[1] as GA4Report | undefined;
        const funnelReport = reports[2] as GA4Report | undefined;
        const websiteReport = reports[3] as GA4Report | undefined;
        const channelReport = reports[4] as GA4Report | undefined;

        const currentRow = summaryReport?.rows?.find(
          (row) => dimension(row, 0) === "current"
        );
        const previousRow = summaryReport?.rows?.find(
          (row) => dimension(row, 0) === "previous"
        );
        const current = metricRecord(currentRow);
        const previous = metricRecord(previousRow);

        const funnelMap = new Map(
          (funnelReport?.rows ?? []).map((row) => [
            dimension(row, 0),
            { count: metric(row, 0), users: metric(row, 1) },
          ])
        );
        const funnel = FUNNEL_EVENTS.map((entry, index) => {
          const values = funnelMap.get(entry.event) ?? { count: 0, users: 0 };
          const previousUsers =
            index === 0
              ? values.users
              : funnelMap.get(FUNNEL_EVENTS[index - 1].event)?.users ?? 0;
          const entryUsers =
            funnelMap.get(FUNNEL_EVENTS[0].event)?.users ?? 0;
          return {
            ...entry,
            ...values,
            from_previous_rate:
              previousUsers > 0 ? (values.users / previousUsers) * 100 : null,
            from_entry_rate:
              entryUsers > 0 ? (values.users / entryUsers) * 100 : null,
          };
        });

        const websiteRows = websiteReport?.rows ?? [];
        const websites = TRACKED_SITES.filter(
          (site) => !input.website || site.id === input.website
        ).map((site) => {
          const matchingRows = websiteRows.filter((row) =>
            site.hosts.includes(dimension(row, 0))
          );
          const values = matchingRows.reduce(
            (accumulator, row) => ({
              users: accumulator.users + metric(row, 0),
              sessions: accumulator.sessions + metric(row, 1),
              page_views: accumulator.page_views + metric(row, 2),
              purchases: accumulator.purchases + metric(row, 3),
              revenue: accumulator.revenue + metric(row, 4),
            }),
            {
              users: 0,
              sessions: 0,
              page_views: 0,
              purchases: 0,
              revenue: 0,
            }
          );
          return {
            id: site.id,
            label: site.label,
            ...values,
            session_to_purchase_rate:
              values.sessions > 0
                ? (values.purchases / values.sessions) * 100
                : null,
          };
        });

        return {
          code: STATUS_OK,
          message: "Success",
          property_id: process.env.GA4_PROPERTY_ID,
          period: {
            start_date: input.start_date,
            end_date: input.end_date,
            previous_start_date: formatDate(previousStart),
            previous_end_date: formatDate(previousEnd),
            days: periodDays,
          },
          metadata: {
            timezone:
              summaryReport?.metadata?.timeZone ??
              dailyReport?.metadata?.timeZone ??
              "Asia/Jakarta",
            currency:
              summaryReport?.metadata?.currencyCode ??
              dailyReport?.metadata?.currencyCode ??
              "IDR",
            generated_at: new Date().toISOString(),
          },
          summary: {
            current,
            previous,
            changes: {
              users: percentChange(current.users, previous.users),
              sessions: percentChange(current.sessions, previous.sessions),
              page_views: percentChange(
                current.page_views,
                previous.page_views
              ),
              purchases: percentChange(
                current.purchases,
                previous.purchases
              ),
              revenue: percentChange(current.revenue, previous.revenue),
            },
          },
          daily: normalizeDailyRows(
            dailyReport?.rows ?? [],
            input.start_date,
            input.end_date
          ),
          funnel,
          websites,
          channels: (channelReport?.rows ?? []).map((row) => ({
            channel: dimension(row, 0) || "(not set)",
            source_medium: dimension(row, 1) || "(not set)",
            sessions: metric(row, 0),
            users: metric(row, 1),
            purchases: metric(row, 2),
            revenue: metric(row, 3),
          })),
        };
      } catch (error) {
        console.error(
          "GA4 dashboard query failed:",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw new TRPCError({
          code: STATUS_INTERNAL_SERVER_ERROR,
          message:
            "GA4 data could not be loaded. Check the property access and server credentials.",
        });
      }
    }),

  bizDashboard: administratorProcedure
    .input(bizInputSchema)
    .query(async ({ input }) => {
      const periodDays = daysBetween(input.start_date, input.end_date);
      if (periodDays < 1 || periodDays > 366) {
        throw new TRPCError({
          code: STATUS_BAD_REQUEST,
          message: "Invalid reporting period.",
        });
      }

      const property = getGA4BizProperty();
      const previousEnd = addDays(
        new Date(`${input.start_date}T00:00:00.000Z`),
        -1
      );
      const previousStart = addDays(previousEnd, -(periodDays - 1));
      const dateRanges = [
        {
          name: "current",
          startDate: input.start_date,
          endDate: input.end_date,
        },
        {
          name: "previous",
          startDate: formatDate(previousStart),
          endDate: formatDate(previousEnd),
        },
      ];
      const currentDateRange = [
        { startDate: input.start_date, endDate: input.end_date },
      ];

      // Traffic reports use only built-in dimensions, so they always resolve.
      const trafficRequests: protos.google.analytics.data.v1beta.IRunReportRequest[] =
        [
          {
            dateRanges,
            metrics: [
              { name: "activeUsers" },
              { name: "sessions" },
              { name: "screenPageViews" },
            ],
          },
          {
            dateRanges: currentDateRange,
            dimensions: [{ name: "date" }],
            metrics: [{ name: "sessions" }, { name: "activeUsers" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
            limit: 366,
          },
          {
            dateRanges: currentDateRange,
            dimensions: [
              { name: "sessionDefaultChannelGroup" },
              { name: "sessionSourceMedium" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "activeUsers" },
              { name: "engagedSessions" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 12,
          },
        ];

      // Batched apart: a missing custom-dimension registration must not blank the whole page.
      const featureRequests: protos.google.analytics.data.v1beta.IRunReportRequest[] =
        [
          {
            dateRanges,
            dimensionFilter: eventNameFilter("view", "click"),
            dimensions: [
              { name: "eventName" },
              { name: FEATURE_NAME_DIMENSION },
            ],
            metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
            limit: 100,
          },
          {
            dateRanges: currentDateRange,
            dimensionFilter: eventNameFilter("view", "click"),
            dimensions: [
              { name: FEATURE_ID_DIMENSION },
              { name: "eventName" },
              { name: FEATURE_NAME_DIMENSION },
            ],
            metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
            limit: 250,
          },
          {
            dateRanges: currentDateRange,
            dimensionFilter: andFilter(
              eventNameFilter("click"),
              featureNameFilter(...BIZ_LEAD_FEATURES)
            ),
            dimensions: [{ name: "date" }],
            metrics: [{ name: "eventCount" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
            limit: 366,
          },
        ];

      let trafficReports: GA4Report[];
      try {
        const [batchResponse] = await getBizAnalyticsClient().batchRunReports({
          property,
          requests: trafficRequests,
        });
        trafficReports = (batchResponse.reports ?? []) as GA4Report[];
      } catch (error) {
        console.error(
          "GA4 BIZ dashboard query failed:",
          error instanceof Error ? error.message : "Unknown error"
        );
        throw new TRPCError({
          code: STATUS_INTERNAL_SERVER_ERROR,
          message:
            "GA4 data could not be loaded. Check GA4_BIZ_PROPERTY_ID, GA4_BIZ_SERVICE_ACCOUNT_JSON, and that the service account has access to the marketing property.",
        });
      }

      // A missing registration only costs the funnel and block table, so report it instead of failing.
      let featureReports: GA4Report[] = [];
      let featureSchemaError: string | null = null;
      try {
        const [batchResponse] = await getBizAnalyticsClient().batchRunReports({
          property,
          requests: featureRequests,
        });
        featureReports = (batchResponse.reports ?? []) as GA4Report[];
      } catch (error) {
        featureSchemaError =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "GA4 BIZ feature schema query failed:",
          featureSchemaError
        );
      }

      const summaryReport = trafficReports[0];
      const dailyReport = trafficReports[1];
      const channelReport = trafficReports[2];
      const funnelReport = featureReports[0];
      const blockReport = featureReports[1];
      const dailyLeadReport = featureReports[2];

      const summaryRowFor = (rangeName: string) =>
        summaryReport?.rows?.find((row) => dimension(row, 0) === rangeName);
      const currentTraffic = bizMetricRecord(summaryRowFor("current"));
      const previousTraffic = bizMetricRecord(summaryRowFor("previous"));

      // date range + eventName + feature_name -> counts, feeding the summary cards and the funnel.
      const featureTotals = new Map<string, { events: number; users: number }>();
      for (const row of funnelReport?.rows ?? []) {
        const range = dimensionByName(funnelReport, row, DATE_RANGE_DIMENSION);
        const event = dimensionByName(funnelReport, row, "eventName");
        const feature = dimensionByName(
          funnelReport,
          row,
          FEATURE_NAME_DIMENSION
        );
        featureTotals.set(`${range}|${event}|${feature}`, {
          events: metric(row, 0),
          users: metric(row, 1),
        });
      }

      // An empty `features` list means every feature_name under that event.
      function totalsFor(
        range: string,
        event: string,
        features: readonly string[]
      ) {
        let events = 0;
        let users = 0;
        for (const [key, value] of featureTotals) {
          const [rowRange, rowEvent, rowFeature] = key.split("|");
          if (rowRange !== range || rowEvent !== event) continue;
          if (features.length > 0 && !features.includes(rowFeature)) continue;
          events += value.events;
          users += value.users;
        }
        return { events, users };
      }

      const summaryFor = (range: string) => ({
        ...(range === "current" ? currentTraffic : previousTraffic),
        cta_clicks: totalsFor(range, "click", []).events,
        leads: totalsFor(range, "click", BIZ_LEAD_FEATURES).events,
      });
      const current = summaryFor("current");
      const previous = summaryFor("previous");

      // feature_id -> views/clicks/leads in page order; built before the funnel, whose stages read it.
      const blockTotals = new Map(
        BIZ_BLOCKS.map((block) => [
          block,
          { views: 0, view_users: 0, clicks: 0, leads: 0 },
        ])
      );
      for (const row of blockReport?.rows ?? []) {
        const block = dimensionByName(blockReport, row, FEATURE_ID_DIMENSION);
        const totals = blockTotals.get(block as BizBlock);
        if (!totals) continue;

        const event = dimensionByName(blockReport, row, "eventName");
        const feature = dimensionByName(
          blockReport,
          row,
          FEATURE_NAME_DIMENSION
        );
        if (event === "view") {
          totals.views += metric(row, 0);
          totals.view_users += metric(row, 1);
        } else if (event === "click") {
          totals.clicks += metric(row, 0);
          if (BIZ_LEAD_FEATURES.includes(feature as FeatureName)) {
            totals.leads += metric(row, 0);
          }
        }
      }
      const blocks = BIZ_BLOCKS.map((block, index) => {
        const totals = blockTotals.get(block)!;
        return {
          id: block,
          label: BIZ_BLOCK_LABELS[block],
          position: index + 1,
          ...totals,
          click_through_rate:
            totals.views > 0 ? (totals.clicks / totals.views) * 100 : null,
        };
      }).filter((block) => block.views > 0 || block.clicks > 0);

      // One event or one block per stage, so every number stays a GA4 user count rather than a sum.
      function stageUsers(stage: (typeof BIZ_FUNNEL_STAGES)[number]) {
        if (stage.source.kind === "block") {
          const totals = blockTotals.get(stage.source.block);
          return { events: totals?.views ?? 0, users: totals?.view_users ?? 0 };
        }
        return totalsFor("current", stage.source.event, stage.source.features);
      }

      const entryStage = stageUsers(BIZ_FUNNEL_STAGES[0]);
      const funnel = BIZ_FUNNEL_STAGES.map((stage, index) => {
        const values = stageUsers(stage);
        const previousStage =
          index === 0 ? values : stageUsers(BIZ_FUNNEL_STAGES[index - 1]);
        // Nav anchors let visitors skip ahead, so a stage may exceed the one above it; clamp at zero.
        const dropOff = Math.max(previousStage.users - values.users, 0);
        return {
          key: stage.key,
          label: stage.label,
          hint: stage.hint,
          count: values.events,
          users: values.users,
          drop_off: index === 0 ? 0 : dropOff,
          drop_off_rate:
            index === 0 || previousStage.users === 0
              ? null
              : (dropOff / previousStage.users) * 100,
          from_previous_rate:
            previousStage.users > 0
              ? (values.users / previousStage.users) * 100
              : null,
          from_entry_rate:
            entryStage.users > 0
              ? (values.users / entryStage.users) * 100
              : null,
        };
      });

      // How far down the landing page visitors actually get, section by section.
      const scrollEntryUsers =
        blockTotals.get(BIZ_SCROLL_BLOCKS[0])?.view_users ?? 0;
      const scroll_depth = BIZ_SCROLL_BLOCKS.map((block, index) => {
        const totals = blockTotals.get(block);
        return {
          id: block,
          label: BIZ_BLOCK_LABELS[block],
          position: index + 1,
          views: totals?.views ?? 0,
          viewers: totals?.view_users ?? 0,
          clicks: totals?.clicks ?? 0,
          reach_rate:
            scrollEntryUsers > 0
              ? ((totals?.view_users ?? 0) / scrollEntryUsers) * 100
              : null,
        };
      });

      // Which kind of CTA visitors actually press, across the whole site.
      const ctaFeatures: FeatureName[] = [
        "anchor_cta",
        "whatsapp_cta",
        "form_submit",
      ];
      const cta_breakdown = ctaFeatures.map((feature) => {
        const values = totalsFor("current", "click", [feature]);
        return {
          feature,
          label: BIZ_FEATURE_LABELS[feature],
          clicks: values.events,
          users: values.users,
          is_lead: BIZ_LEAD_FEATURES.includes(feature),
        };
      });

      return {
        code: STATUS_OK,
        message: "Success",
        property_id: process.env.GA4_BIZ_PROPERTY_ID,
        period: {
          start_date: input.start_date,
          end_date: input.end_date,
          previous_start_date: formatDate(previousStart),
          previous_end_date: formatDate(previousEnd),
          days: periodDays,
        },
        metadata: {
          timezone: summaryReport?.metadata?.timeZone ?? "Asia/Jakarta",
          generated_at: new Date().toISOString(),
        },
        // False means the custom dimensions are not registered, so funnel and blocks read nothing.
        feature_schema: {
          available: featureSchemaError === null,
          message: featureSchemaError,
        },
        summary: {
          current,
          previous,
          changes: {
            users: percentChange(current.users, previous.users),
            sessions: percentChange(current.sessions, previous.sessions),
            page_views: percentChange(current.page_views, previous.page_views),
            cta_clicks: percentChange(current.cta_clicks, previous.cta_clicks),
            leads: percentChange(current.leads, previous.leads),
          },
        },
        daily: normalizeBizDailyRows(
          dailyReport?.rows ?? [],
          dailyLeadReport?.rows ?? [],
          input.start_date,
          input.end_date
        ),
        funnel,
        blocks,
        scroll_depth,
        cta_breakdown,
        channels: (channelReport?.rows ?? []).map((row) => ({
          channel: dimension(row, 0) || "(not set)",
          source_medium: dimension(row, 1) || "(not set)",
          sessions: metric(row, 0),
          users: metric(row, 1),
          engaged_sessions: metric(row, 2),
          engagement_rate:
            metric(row, 0) > 0 ? (metric(row, 2) / metric(row, 0)) * 100 : null,
        })),
      };
    }),
};
