import Script from "next/script";

// The dataLayer and gtm.js start event are queued right away; the container itself loads once the page is idle.
export default function GoogleTagManager({ gtmId }: { gtmId: string }) {
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});`}
      </Script>
      <Script
        id="gtm-src"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        strategy="lazyOnload"
      />
    </>
  );
}
