# Google Analytics 4 Data API

The OS tracking dashboard reads GA4 reporting data on the server. Credentials
must never be exposed through a `NEXT_PUBLIC_*` variable or imported into a
client component.

## Required access

- GA4 property: `544892398`
- Service account:
  `ailene-ga4-api@ailene-b2c-analytics-640u3x.iam.gserviceaccount.com`
- The service account needs at least **Viewer** access to the GA4 property.
- The Google Analytics Data API must be enabled in the service account's Google
  Cloud project.

## Environment variables

```bash
GA4_PROPERTY_ID="544892398"
```

For local development, point Application Default Credentials to the downloaded
service-account file:

```bash
GOOGLE_APPLICATION_CREDENTIALS="C:\absolute\path\to\service-account.json"
```

For hosted environments where a credential file is not available, store the
entire service-account JSON as a protected server-side environment variable:

```bash
GA4_SERVICE_ACCOUNT_JSON="{...}"
```

The dashboard route is administrator-only and is available at `/tracking` on
the OS subdomain.
