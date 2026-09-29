"use client";

import Script from "next/script";

// Hardcoded for now; move back to an env var once it's set on the deploy.
const GOOGLE_ADS_ID = "AW-18418654652";

export default function GoogleAdsTagBIZ() {
  return (
    <>
      <Script
        id="google-ads-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GOOGLE_ADS_ID}");`}
      </Script>
    </>
  );
}
