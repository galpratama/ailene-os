import Script from "next/script";

// Hardcoded for now; move back to an env var once it's set on the deploy.
const GOOGLE_ADS_ID = "AW-18418654652";

// One gtag.js serves both Google Ads and GA4. gtag() queues into the dataLayer right away, so conversions fired before the library arrives still send.
export default function GoogleTagBIZ() {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const configs = [GOOGLE_ADS_ID, googleAnalyticsId]
    .filter(Boolean)
    .map((id) => `gtag("config","${id}");`)
    .join("");

  return (
    <>
      <Script id="google-gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=gtag;gtag("js",new Date());${configs}`}
      </Script>
      <Script
        id="google-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="lazyOnload"
      />
    </>
  );
}
