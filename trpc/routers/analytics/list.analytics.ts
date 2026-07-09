import { analyticsDataClient, getGA4Property } from "@/lib/google-analytics";
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
        const [batchResponse] = await analyticsDataClient.batchRunReports({
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
};
