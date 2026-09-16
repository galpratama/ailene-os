import "server-only";

// Pinned in code, not the environment, so a version bump arrives as a reviewed change.
const GRAPH_API_VERSION = "v23.0";
const GRAPH_HOST = "https://graph.facebook.com";

export type MetaAdsCredentials = {
  accountId: string;
  accessToken: string;
};

// Every numeric field in the Insights API arrives as a string.
export type MetaActionRow = {
  action_type: string;
  value: string;
  "1d_click"?: string;
  "7d_click"?: string;
  "1d_view"?: string;
};

export type MetaInsightsRow = {
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  spend?: string;
  clicks?: string;
  inline_link_clicks?: string;
  ctr?: string;
  inline_link_click_ctr?: string;
  cpc?: string;
  cpm?: string;
  cpp?: string;
  actions?: MetaActionRow[];
  cost_per_action_type?: MetaActionRow[];
  action_values?: MetaActionRow[];
  quality_ranking?: string;
  engagement_rate_ranking?: string;
  conversion_rate_ranking?: string;
  objective?: string;
  publisher_platform?: string;
  platform_position?: string;
  age?: string;
  gender?: string;
};

export type MetaAdAccount = {
  id: string;
  name?: string;
  account_id?: string;
  currency?: string;
  timezone_name?: string;
  account_status?: number;
};

export type MetaAdCreative = {
  id: string;
  name?: string;
  status?: string;
  effective_status?: string;
  creative?: {
    id?: string;
    thumbnail_url?: string;
    object_type?: string;
    title?: string;
    body?: string;
  };
};

type GraphErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    error_user_msg?: string;
    fbtrace_id?: string;
  };
};

// Thrown for anything the Graph API rejected, so the router can report a readable reason.
export class MetaAdsError extends Error {
  readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "MetaAdsError";
    this.code = code;
  }
}

// `act_123` and `123` both appear in Meta's own UI; normalize to the bare id.
function normalizeAccountId(rawAccountId: string) {
  return rawAccountId.trim().replace(/^act_/i, "");
}

export function isMetaAdsConfigured() {
  return Boolean(
    process.env.META_ADS_ACCOUNT_ID?.trim() &&
      process.env.META_ADS_ACCESS_TOKEN?.trim()
  );
}

export function getMetaAdsCredentials(): MetaAdsCredentials {
  const accountId = process.env.META_ADS_ACCOUNT_ID?.trim();
  const accessToken = process.env.META_ADS_ACCESS_TOKEN?.trim();

  if (!accountId || !accessToken) {
    throw new MetaAdsError(
      "META_ADS_ACCOUNT_ID and META_ADS_ACCESS_TOKEN are not configured."
    );
  }

  return {
    accountId: normalizeAccountId(accountId),
    accessToken,
  };
}

function buildUrl(
  credentials: MetaAdsCredentials,
  path: string,
  params: Record<string, string | number | undefined>
) {
  const url = new URL(`${GRAPH_HOST}/${GRAPH_API_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("access_token", credentials.accessToken);
  return url;
}

async function graphRequest<T>(url: URL): Promise<T> {
  // Ad numbers change all day; never let Next's fetch cache serve yesterday's spend.
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as T & GraphErrorBody;

  if (!response.ok || body.error) {
    const error = body.error;
    throw new MetaAdsError(
      error?.error_user_msg ||
        error?.message ||
        `Meta Graph API returned ${response.status}.`,
      error?.code
    );
  }

  return body;
}

// The access token is a credential, so scrub it before anything is logged.
export function redactToken(message: string) {
  return message.replace(/access_token=[^&\s]+/gi, "access_token=***");
}

export async function getMetaAdAccount(credentials: MetaAdsCredentials) {
  const url = buildUrl(credentials, `act_${credentials.accountId}`, {
    fields: "name,account_id,currency,timezone_name,account_status",
  });
  return graphRequest<MetaAdAccount>(url);
}

type InsightsParams = {
  since: string;
  until: string;
  level: "account" | "campaign" | "adset" | "ad";
  fields: string[];
  breakdowns?: string[];
  timeIncrement?: number;
  sort?: string;
  limit?: number;
  // Hard stop on `paging.next` follows, so one runaway breakdown cannot hang the request.
  maxPages?: number;
};

export async function fetchMetaInsights(
  credentials: MetaAdsCredentials,
  params: InsightsParams
): Promise<MetaInsightsRow[]> {
  let url: URL | null = buildUrl(
    credentials,
    `act_${credentials.accountId}/insights`,
    {
      time_range: JSON.stringify({
        since: params.since,
        until: params.until,
      }),
      level: params.level,
      fields: params.fields.join(","),
      breakdowns: params.breakdowns?.join(","),
      time_increment: params.timeIncrement,
      // Documented as a list, so a bare string is rejected by some versions.
      sort: params.sort ? JSON.stringify([params.sort]) : undefined,
      limit: params.limit ?? 100,
      // Stated explicitly so a change to the account's default never shifts these numbers.
      action_attribution_windows: JSON.stringify(["7d_click", "1d_view"]),
    }
  );

  const rows: MetaInsightsRow[] = [];
  const maxPages = params.maxPages ?? 4;

  for (let page = 0; page < maxPages && url; page++) {
    const body: { data?: MetaInsightsRow[]; paging?: { next?: string } } =
      await graphRequest<{
        data?: MetaInsightsRow[];
        paging?: { next?: string };
      }>(url);
    rows.push(...(body.data ?? []));
    url = body.paging?.next ? new URL(body.paging.next) : null;
  }

  return rows;
}

// Thumbnails live on the ad, not its insights row, so only the ids that spent are fetched.
export async function fetchMetaAdCreatives(
  credentials: MetaAdsCredentials,
  adIds: string[]
): Promise<Record<string, MetaAdCreative>> {
  if (adIds.length === 0) return {};

  const results: Record<string, MetaAdCreative> = {};
  // The older `?ids=` multi-get was removed by Meta, even on pinned older versions.
  for (let start = 0; start < adIds.length; start += 50) {
    const batch = adIds.slice(start, start + 50);
    const url = buildUrl(credentials, `act_${credentials.accountId}/ads`, {
      fields:
        "id,name,status,effective_status,creative{id,thumbnail_url,object_type,title,body}",
      filtering: JSON.stringify([
        { field: "id", operator: "IN", value: batch },
      ]),
      limit: batch.length,
    });
    const body = await graphRequest<{ data?: MetaAdCreative[] }>(url);
    for (const ad of body.data ?? []) {
      results[ad.id] = ad;
    }
  }

  return results;
}
