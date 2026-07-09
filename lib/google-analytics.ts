import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
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

function getInlineCredentials(): ServiceAccountCredentials | undefined {
  const rawCredentials = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!rawCredentials) return undefined;

  const parsed = parseCredentialsJSON(rawCredentials);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "GA4_SERVICE_ACCOUNT_JSON must include client_email and private_key."
    );
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replaceAll("\\n", "\n"),
  };
}

function createAnalyticsClient() {
  const credentials = getInlineCredentials();
  return new BetaAnalyticsDataClient(
    credentials ? { credentials } : undefined
  );
}

const globalForAnalytics = globalThis as unknown as {
  ga4AnalyticsDataClient?: BetaAnalyticsDataClient;
};

export const analyticsDataClient =
  globalForAnalytics.ga4AnalyticsDataClient ?? createAnalyticsClient();

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.ga4AnalyticsDataClient = analyticsDataClient;
}

export function getGA4Property() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured.");
  }
  return `properties/${propertyId}`;
}
