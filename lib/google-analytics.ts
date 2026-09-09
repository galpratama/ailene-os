import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

// Env var name (for error messages) plus its value, read at the call site to avoid a dynamic key.
type CredentialSource = {
  variable: string;
  rawCredentials: string | undefined;
};

function parseCredentialsJSON(rawCredentials: string) {
  try {
    return JSON.parse(rawCredentials) as Partial<ServiceAccountCredentials>;
  } catch (initialError) {
    // Some deployment dashboards turn the `\n` sequences inside private_key
    // into literal line breaks. That is valid for the PEM value, but invalid
    // inside a JSON string, so normalize only that field and retry.
    const normalizedCredentials = rawCredentials.replace(
      /("private_key"\s*:\s*")([\s\S]*?)("\s*[,}])/,
      (_match, prefix: string, privateKey: string, suffix: string) =>
        `${prefix}${privateKey
          .replaceAll("\r", "\\r")
          .replaceAll("\n", "\\n")}${suffix}`
    );

    if (normalizedCredentials === rawCredentials) {
      throw initialError;
    }

    return JSON.parse(
      normalizedCredentials
    ) as Partial<ServiceAccountCredentials>;
  }
}

function getInlineCredentials(
  source: CredentialSource
): ServiceAccountCredentials | undefined {
  if (!source.rawCredentials) return undefined;

  const parsed = parseCredentialsJSON(source.rawCredentials);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      `${source.variable} must include client_email and private_key.`
    );
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replaceAll("\\n", "\n"),
  };
}

// First source that is set wins; with none set the client uses Application Default Credentials.
function createAnalyticsClient(sources: CredentialSource[]) {
  for (const source of sources) {
    const credentials = getInlineCredentials(source);
    if (credentials) return new BetaAnalyticsDataClient({ credentials });
  }
  return new BetaAnalyticsDataClient();
}

const globalForAnalytics = globalThis as unknown as {
  ga4AnalyticsDataClient?: BetaAnalyticsDataClient;
  ga4BizAnalyticsDataClient?: BetaAnalyticsDataClient;
};

// Built on first use, so a malformed credential JSON fails one query instead of the whole build.
function memoizedClient(
  cacheKey: "ga4AnalyticsDataClient" | "ga4BizAnalyticsDataClient",
  sources: CredentialSource[]
) {
  const cached = globalForAnalytics[cacheKey];
  if (cached) return cached;

  const client = createAnalyticsClient(sources);
  globalForAnalytics[cacheKey] = client;
  return client;
}

// B2C — the product sites' GA4 property, behind the OS "Tracking" tab.
export function getAnalyticsClient() {
  return memoizedClient("ga4AnalyticsDataClient", [
    {
      variable: "GA4_SERVICE_ACCOUNT_JSON",
      rawCredentials: process.env.GA4_SERVICE_ACCOUNT_JSON,
    },
  ]);
}

// B2B — the biz.* marketing property, usually with its own service account.
export function getBizAnalyticsClient() {
  return memoizedClient("ga4BizAnalyticsDataClient", [
    {
      variable: "GA4_BIZ_SERVICE_ACCOUNT_JSON",
      rawCredentials: process.env.GA4_BIZ_SERVICE_ACCOUNT_JSON,
    },
    {
      variable: "GA4_SERVICE_ACCOUNT_JSON",
      rawCredentials: process.env.GA4_SERVICE_ACCOUNT_JSON,
    },
  ]);
}

export function getGA4Property() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured.");
  }
  return `properties/${propertyId}`;
}

// The marketing site reports into its own GA4 property, separate from the B2C product sites.
export function getGA4BizProperty() {
  const propertyId = process.env.GA4_BIZ_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4_BIZ_PROPERTY_ID is not configured.");
  }
  return `properties/${propertyId}`;
}
