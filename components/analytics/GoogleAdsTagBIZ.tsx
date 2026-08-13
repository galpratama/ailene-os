"use client";

import Script from "next/script";

// Renders nothing until BD/Marketing supplies NEXT_PUBLIC_GOOGLE_ADS_ID — safe no-op, never breaks the page.
export default function GoogleAdsTagBIZ() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId) return null;

  return (
    <>
      <Script
        id="google-ads-gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${adsId}");`}
      </Script>
    </>
  );
}
